import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

// --- Helpers ---
const mapDBToUIStatus = (dbName) => {
  const name = dbName?.toLowerCase();
  if (name === 'completada') return 'completed';
  if (name === 'en progreso') return 'send_by';
  if (name === 'nueva') return 'new';
  if (name === 'cancelado') return 'canceled';
  return 'pending'; 
};

const mapUIToDBStatusName = (uiStatus) => {
  if (uiStatus === 'completed') return 'Completada';
  if (uiStatus === 'send_by') return 'En progreso';
  if (uiStatus === 'new') return 'Nueva';
  if (uiStatus === 'canceled') return 'Cancelado';
  return 'Pendiente';
};

const formatLocalYYYYMMDD = (utcDateString) => {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  if (isNaN(date)) return utcDateString.split('T')[0];
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// --- Fetch Hook ---
export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const [orderRes, statusRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            id, created_at, delivery_date, completed_at, total,
            buyer_name, buyer_address, buyer_phone, buyer_email,
            order_status ( id, name ),
            order_item (
              id, product_id, product_name, quantity, unit_price,
              order_item_option ( category_name, option_name, additional_price )
            )
          `)
          .eq('id', id)
          .single(),
        supabase.from('order_status').select('id, name')
      ]);

      if (orderRes.error) throw orderRes.error;
      if (statusRes.error) throw statusRes.error;

      const orderData = orderRes.data;

      const sMap = {};
      statusRes.data.forEach(s => {
        sMap[s.name] = s.id;
      });

      const productIds = [
        ...new Set(orderData.order_item.map((item) => item.product_id).filter(Boolean))
      ];

      let imagesMap = {};
      if (productIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_image')
          .select('product_id, image_url')
          .in('product_id', productIds);

        if (!imagesError && imagesData) {
          imagesMap = imagesData.reduce((acc, img) => {
            if (!acc[img.product_id]) acc[img.product_id] = img.image_url;
            return acc;
          }, {});
        }
      }

      const formattedProducts = [];
      orderData.order_item.forEach(item => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          formattedProducts.push({
            id: item.id,
            name: item.product_name,
            price: `$${Number(item.unit_price).toFixed(2)}`,
            image: item.product_id ? (imagesMap[item.product_id] || '') : '',
            customizations: (item.order_item_option || []).map(opt => ({
              category: opt.category_name,
              option: opt.option_name,
              price: `$${Number(opt.additional_price).toFixed(2)}`
            }))
          });
        }
      });

      const uiStatus = mapDBToUIStatus(orderData.order_status?.name);
      const dateOrdered = orderData.created_at ? formatLocalYYYYMMDD(orderData.created_at) : 'N/A';
      const dateAction = orderData.completed_at 
        ? formatLocalYYYYMMDD(orderData.completed_at) 
        : (orderData.delivery_date ? formatLocalYYYYMMDD(orderData.delivery_date) : 'N/A');

      // Return both the formatted order AND the status map so the mutation can use it
      return {
        order: {
          id: orderData.id,
          status: uiStatus,
          dateOrdered,
          dateAction,
          total: orderData.total,
          buyer: {
            name: orderData.buyer_name,
            phone: orderData.buyer_phone,
            address: orderData.buyer_address,
            email: orderData.buyer_email || ''
          },
          products: formattedProducts
        },
        statusMap: sMap
      };
    },
    enabled: !!id,
  });
};

// --- Mutation Hook ---
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newUIStatus, statusMap }) => {
      const targetDbName = mapUIToDBStatusName(newUIStatus);
      const targetDbId = statusMap[targetDbName];

      if (!targetDbId) throw new Error("Target status ID not found in mapping");

      const updatePayload = { status_id: targetDbId };
      
      if (newUIStatus === 'completed') {
        updatePayload.completed_at = new Date().toISOString();
      } else {
        updatePayload.completed_at = null;
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);

      if (error) throw error;
      return newUIStatus;
    },
    onSuccess: (data, variables) => {
      // 1. Invalidate this specific order to immediately reflect the new status
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      // 2. Invalidate the generic orders lists so NewOrders and AllOrders update
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
};