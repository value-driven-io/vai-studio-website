Supplier API - GetYourGuide Endpoints (1.0)
Deals

The deals feature allows you to send us Deals (or) Discounted prices for your products via API

With the Deals feature, you can

    Create new Deals
    List Deals
    Delete a Deal

Guardrails on Deals

Early_Bird Deals

    Notice Period must be smaller than the number of days before the special offer begins
    Notice Period has to be greater than or equal to 7 days

Last Minute Deals

    Notice Period has to be less than or equal to 3 days

List Deals

The list deals endpoint allows you to list all existing deals for a product. This endpoint will only list deals that were created via API.
Authorizations:
BasicAuth
query Parameters
externalProductId
required
	
string
Example: externalProductId=PPYM1U

The ID of the product in the partner's system
Responses
Response Schema: application/json
Array of objects (Deal)

List of deals
Response Schema: application/json
errorCode	
string
Value: "VALIDATION_FAILURE"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Value: "AUTHORIZATION_FAILURE"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Value: "INTERNAL_SYSTEM_FAILURE"
errorMessage	
string

Response samples

    200400401500

Content type
application/json
{

    "deals": 

[

{

    "dealId": 36457,
    "dealName": "Last minute deal",
    "dateRange": 

    {
        "start": "2023-08-21",
        "end": "2023-08-31"
    },
    "dealType": "last_minute",
    "maxVacancies": 10,
    "discountPercentage": 10.5,
    "gygTourOptionId": 3764930

},
{

    "dealId": 285950,
    "dealName": "Early bird deal",
    "dateRange": 

            {
                "start": "2023-12-21",
                "end": "2023-12-31"
            },
            "dealType": "early_bird",
            "maxVacancies": 5,
            "discountPercentage": 12.5,
            "gygTourOptionId": 927383
        }
    ]

}
Create a Deal

The create deals endpoint allows you to send us a new deal for a particular product in your system.
Authorizations:
BasicAuth
Request Body schema: application/json
required
	
object
Responses
Response Schema: application/json
Array of objects (DealIdAndTourOptionId)

A list of the created deals
Response Schema: application/json
errorCode	
string
Value: "VALIDATION_FAILURE"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Value: "AUTHORIZATION_FAILURE"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Value: "INTERNAL_SYSTEM_FAILURE"
errorMessage	
string

Request samples

    Payload

Content type
application/json
{

    "data": 

{

    "externalProductId": "PPYM1U",
    "dealName": "Last minute deal",
    "dateRange": 

        {
            "start": "2023-08-21",
            "end": "2023-08-31"
        },
        "dealType": "last_minute",
        "maxVacancies": 10,
        "discountPercentage": 10.5,
        "noticePeriodDays": 3
    }

}
Response samples

    201400401500

Content type
application/json
{

    "deals": 

[

        {
            "dealId": 36457,
            "gygTourOptionId": 3764930
        }
    ]

}
Delete a deal

The delete deals endpoint allows you to delete deals that were created using the create deals endpoint.
Authorizations:
BasicAuth
path Parameters
dealId
required
	
integer <int64>
Example: 1

The deal identifier in GetYourGuide's system
Responses
Response Schema: application/json
errorCode	
string
Value: "VALIDATION_FAILURE"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Value: "AUTHORIZATION_FAILURE"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Enum: "INVALID_PRODUCT" "RESOURCE_NOT_FOUND"
errorMessage	
string
Response Schema: application/json
errorCode	
string
Value: "INTERNAL_SYSTEM_FAILURE"
errorMessage	
string

Response samples

    400401404500

Content type
application/json
{

    "errorCode": "VALIDATION_FAILURE",
    "errorMessage": "Please check the request and the deal ID provided"

}
Products
Reactivate a Deactivated Product

The reactivation endpoint offers the ability to reactivate a deactivated product. A deactivation may be caused by an incident.

To reactivate an option, you must include the GetYourGuide Option ID as a parameter in the API path and the Product ID from your system in the body of your request. This must be a string.

The GetYourGuide Option ID for a deactivated product can be found in the incident notification email sent to you and our mutual supplier.

When you call this endpoint with a Product ID, it will reactivate the corresponding product in our system.

The option must have been connected to your system at the time of the deactivation, and you cannot activate a product that has never been connected to your system.
Guidelines for Reactivations

What are the limits on reactivations from GYG?

    The endpoint is rate-limited to 1000 requests per hour per partner.
    If the limit is exceeded, you will receive a 429 error code. We reserve the right to disable the endpoint if the limits are abused.

Authorizations:
BasicAuth
path Parameters
GYG-Option-ID
required
	
integer

The unique GetYourGuide Option ID of the product that you wish to reactivate.
Request Body schema: application/json
required
	
object
Responses
Response Schema: application/json
required
	
object

Request samples

    Payload

Content type
application/json
{

    "data": 

    {
        "externalProductId": "prod123"
    }

}
Response samples

    200400401404500

Content type
application/json
{

    "data": 

    {
        "message": "GYG-Option-ID reactivated successfully with externalProductId {external-product-id}"
    }

}
Suppliers
Register a new supplier

The supplier registration endpoint allows you to register a new supplier on GetYourGuide. This is relevant for suppliers who are not yet registered with GetYourGuide and want to connect and start selling their products on our platform.

Notification
When a supplier tries to register using this feature, you (reservation system) would receive an email notifying about the success (or) failure of the registration with the details.

Additional Requirements
For GetYourGuide to register a new supplier, we need them to agree to our Terms and Conditions.
To satisfy this requirement, we need for you to put the following addendum right after the button that invokes the Supplier registration over API on your end:

    By clicking on the button above you agree to the Supplier Terms and Conditions and the Privacy Policy from GetYourGuide.

Authorizations:
BasicAuth
Request Body schema: application/json
object

Contains supplier details for registration.
Responses
Response Schema: application/json
required
	
object

Request samples

    Payload

Content type
application/json
{

    "data": 

    {
        "externalSupplierId": "12345XYZ",
        "firstName": "John",
        "lastName": "Doe",
        "legalCompanyName": "Example LLC",
        "websiteUrl": "http:​//example.com",
        "country": "USA",
        "currency": "USD",
        "email": "contact@example.com",
        "legalStatus": "company",
        "mobileNumber": "+11234567890",
        "city": "US BOY",
        "postalCode": "10001",
        "stateOrRegion": "New York"
    }

}
Response samples

    202400401409500

Content type
application/json
{

    "data": 

    {
        "message": "Supplier registration accepted. Please wait for the confirmation email about the result."
    }

}
Redemption

The redemption endpoints are used to redeem a single ticket or an entire booking. GetYourGuide support two types of redemption:

    Single Ticket Redemption: This is used to redeem a single ticket.
    Booking Redemption: This is used to redeem an entire booking.

Ticket Redemption by Ticket Code

This endpoint should be called by the supplier when a ticket is redeemed by a customer. The response will indicate the success or failure of ticket redemption process.
Authorizations:
BasicAuth
Request Body schema: application/json
required
	
object
Responses
Response Schema: application/json
success
required
	
boolean

Request samples

    Payload

Content type
application/json
{

    "data": 

    {
        "ticketCode": "TICKET238",
        "gygBookingReference": "GYG1B2D34GHI"
    }

}
Response samples

    200400401404500

Content type
application/json
{

    "success": true

}
Ticket Redemption by Booking Reference

This endpoint should be called by the supplier when all the tickets of a booking are redeemed by the customer.

Calling this endpoint will result in all tickets of the booking to be marked as redeemed.

The response will indicate the success or failure of ticket redemption process
Authorizations:
BasicAuth
Request Body schema: application/json
required
	
object
Responses
Response Schema: application/json
success
required
	
boolean

Request samples

    Payload

Content type
application/json
{

    "data": 

    {
        "gygBookingReference": "GYG1B2D34GHI"
    }

}
Response samples

    200400401404500

Content type
application/json
{

    "success": true

}
« Previous: Supplier-side Endpoints
© 2008–2025 GetYourGuide
About Us

    Connectivity Partner Program
    Supplier Portal
    About GetYourGuide
    Customer Website

Support

    FAQs
    Contact

Legal

    Legal Notice
    Privacy Policy
    Terms and Conditions

