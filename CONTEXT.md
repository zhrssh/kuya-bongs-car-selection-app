# Context: Kuya Bongs Car Selection App

## Ubiquitous Language

### Entities

- **Car**: A vehicle listed for sale. It has attributes like make, model, year, price, mileage, fuel type, transmission, body type, exterior color, interior color, engine, drivetrain, features, description, condition, and images.
- **Seller**: A persistent individual assigned to one or more cars. They do not need to register in the system.
- **Client (Admin)**: The primary user who manages the inventory (Cars) and the list of Sellers.
- **Buyer**: An anonymous user with read-only access to the storefront to view available cars.

### Roles

- **Admin**: Has full access to the back-office to perform CRUD operations on Cars and Sellers.

## Business Rules

- **Seller-to-Car Relationship**: Each `Car` is assigned to exactly one `Seller`, but a `Seller` can be associated with multiple `Cars`.
- **Seller Management**: Sellers are created and managed by the Client; they do not have accounts.
- **Anonymous Browsing**: Buyers do not require accounts to view car listings.
- **Single Admin**: The system is designed for a single Client account for initial deployment.
