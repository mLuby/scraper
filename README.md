# Create a price notification service
(120 minutes)

## Overview
Our fictional company manages the properties of owners we partner with. To maximize bookings
owners are constantly updating their property's dynamicDisplayPrice.

Our team has built out the following API endpoint to facilitate fetching property information. The feed
of prices updates every 5 seconds.

- https://interview.domio.io/properties/ : Fetches all properties and their current display price.

## Deliverables

1. Create a new service that consumes the endpoint above and tracks all price changes for all
properties over time. Use persistent storage such as SQLite or similar to store the data as it is collected.
  - We'd like to track: id, type, dynamicDisplayPrice, basePrice, datetime of price

2. There are two types of properties, apartment and home. Every time the dynamicDisplayPrice
changes there can be events that require us to notify an admin via email. You can use any email setup
or API you wish to accomplish this goal.
  - Apartments: Notify whenever the dynamicDisplayPrice is less than the basePrice
  - Homes: Notify whenever the dynamicDisplayPrice is more than the basePrice

3. (Written) Now, let's assume that over time, we'll be adding dozens of different property types
with their own messaging rules and messaging platforms (such as sms or push). How do we support
this? Would you change anything in your implementation?

4. (Bonus) Update your code to handle application or server level failure states. For example, how
do we ensure data is never missed? What do we do if we do miss a fetch cycle? What if our email API
provider goes down? If you handle these edge cases please add supporting documentation to your
README.

This is an open ended question with no strictly correct solution. For this challenge, pretend your
solution will be going into production and create any documentation, tests, or other associated work
as needed.

Sharing your solution: Create a zip file with your solution and share this with
tech-interviews@staydomio.com. If you have any questions don't hesitate to reach out!
