import React, { useEffect }from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModifyListingPage from '../components/pages/ModifyListingPage'; 
import NavBar from '../components/NavBar';
import { MOCK_LISTINGS } from '../data/MockData'; 

const EditListing = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const navigate = useNavigate();
  const { username, id } = useParams();

  // Find the specific listing from your mock data using the ID from the URL
  const listing = MOCK_LISTINGS.find(item => item.id === parseInt(id));

  // Safety check in case the listing doesn't exist
  if (!listing) {
    return (
      <div className="page-container flex-center">
        <h2>Listing not found.</h2>
      </div>
    );
  }

  // Map the MOCK_LISTINGS data to the property names ModifyListingPage expects
  const existingProductData = {
    name: listing.name,
    price: listing.price,
    image: listing.image || [], // Updated key from 'images' to 'image'
    description: listing.description || "",
    amount: listing.amountAvailable || "", 
    delivery: listing.delivery,
    customizations: listing.customizations || []
  };

  return (
    <>
      <ModifyListingPage 
        pageTitle="Edit product"
        buttonText="Save Changes"
        successMessage="Listing updated successfully!"
        initialData={existingProductData}
        onSubmitSuccess={() => navigate(`/${username}/listing/${id}`)}
      />

      <NavBar />
    </>
  );
};

export default EditListing;