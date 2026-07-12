# App Description

Build a responsive frontend for an MVP seller dashboard designed to help businesses manage orders and eliminate "DM-Chaos".

# Tech Stack

**Framework:** Vite + React

**Language:** JavaScript

**Styling:** Standard CSS

**Icons:** Lucide React 

# File Structure

src/
├─ components/    -----------------------> Reusable components of small structuring elements
│  ├─ Input.jsx   -----------------------> Takes user input and has a label
│  ├─ ActionButton.jsx ------------------> Big action buttons found at the bottom of the page
│  ├─ Checkbox.jsx ----------------------> A checkbox accompanied by text
│  ├─ Toggle.jsx ------------------------> A toggle accompanied by toggle
│  ├─ VerticalCard.jsx ------------------> A vertical card with image, takes up to three text inputs
│  ├─ HorizontalCardRight.jsx -----------> A horizontal card with an image on the right, main text, secondary text, and an optional badge
│  ├─ HorizontalCardLeft.jsx ------------> A horizontal card with an image on the left, main text, secondary text, and an optional badge
│  ├─ SectionWithCards.jsx  -------------> A Section that contains a title, VerticalCards, and a View All button
│  ├─ SearchBar.jsx ---------------------> A Search Bar
│  ├─ BackButton.jsx --------------------> A button that contains a left arrow and the descriptive "Back"
│  ├─ Image.jsx -------------------------> An image container in square, changes size depending on the parent
│  ├─ Dropdown.jsx ----------------------> A dropdown that changes size depending on the parent and accepts variable inputs for options as props
│  ├─ DetailsLine.jsx -------------------> Short text that is divided by bullets and is contained in one single line. Its size and font size depends on props and the parent
│  ├─ BuyerInfo.jsx ---------------------> Contains a main text with the buyer's name, and secondary text with the buyer's phone number and email address.
│  ├─ Badges.jsx ------------------------> Badges that accept an icon and text. Change color and size depending on the props and the parent.
│  ├─ HeaderText.jsx --------------------> Main text or title
│  ├─ EditButton.jsx --------------------> Button with "Edit" descriptive.
│  ├─ CustomizationDetail.jsx -----------> Section that displays a main title, followed by a divider, horizontal cards, and a mandatory badge.
│  ├─ ImageCarrousel.jsx ----------------> Displays images in a carrousel. Its size depends on the parent and accepts any number of images. 
│  ├─ ModifierButton.jsx ----------------> A circle button with an icon inside. Its color can vary.
│  ├─ ProductOrderedDetail.jsx ----------> Image with Title, Secondary text, and multiple categories with their value
│  ├─ NavBar.jsx ------------------------> A navigation bar with three buttons
│  │
│  ├─ pages/       -----------------------> Components that structure one whole page.
│  │  ├─ HorizontalListPage.jsx ----------> Contains a main header, a search bar, badges that serve for filtering and sorting, followed by optional HorizontalCardLeft (none, one, or multiple)
│  │  ├─ CardList.jsx --------------------> Contains a main header, a search bar, and a grid of optional VerticalCard (none, one, or multiple)
│  │  ├─ ListingDetailPage.jsx -----------> Contains a main header, an Edit button, an image carrousel, text, and a CustomizationDetail
│  │  ├─ OrderDetailPage.jsx -------------> Contains a main header, title, a divider, a DetailsLine, a dropdown, BuyerInfo, and horizontal left cards.
│  │  ├─ ProductOrderedDetailPage.jsx ----> Contains a main header and a ProductOrderedDetail
│  │
├─ links/
│  ├─ Login.jsx --------------------------> Asks for email and password to login to account
│  ├─ CreateSeller.jsx -------------------> Asks for name, email, phone number, and password to create a seller account
│  ├─ CreateStore.jsx --------------------> Asks for store name, slug, email, phone number, instagram, store address, store description, and custom message to create a store
│  ├─ CreateProduct.jsx ------------------> Asks for images, product name, product base price, customizations, options for each customizations, added price for each option, the amount available for the product and delivery availability
│  ├─ Home.jsx
│  ├─ AllOrders.jsx ----------------------> Displays All Orders in a HorizontalListPage.
│  ├─ PendingOrders.jsx ------------------> Displays Pending Orders in a HorizontalListPage.
│  ├─ OrderDetail.jsx --------------------> Displays Order Details in a OrderDetailPage.
│  ├─ ProductOrderedDetail.jsx -----------> Displays the details of a product that has been ordered in a ProductOrderedDetailPage.
│  ├─ Listings.jsx -----------------------> Displays all listings in a CardList
│  ├─ ListingDetail.jsx ------------------> Displays details of a listing in a ListingDetailPage
│  │
├─ App.jsx -------------------------------> Serves as a router for all links
├─ App.css -------------------------------> Global styling


# Flow Structure

                                          ┌──► PendingOrders │                                        
                                          │                  └──┬─► OrderDetail ─────► ProductsOrdered
Login  ─┐                                 │                     │                                     
        └───────────────────────► Home ───┼──► AllOrders ───────┘                                     
                                   ▲      │                                                           
                                   │      │                                                           
Create Seller  ──► CreateStore ────┘      └──► Listings ──────────► ListingDetail                     



# Style

**Primary Color:** Purple (use soft, modern shades like violet or indigo for accents, buttons, and focus states).

**Style:** Minimalistic, clean, and friendly. Avoid heavy borders or cluttered layouts. Use ample whitespace, soft rounded corners, and subtle shadows to create a welcoming interface.

**Accessibility:** The code must include semantic HTML, proper ARIA labels, clear focus states for keyboard navigation, and high-contrast text.