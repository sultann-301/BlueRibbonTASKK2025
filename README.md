# Getting Started
First, in the root directory of the project run:
 ```bash
 npm install
 ```
 Then add a ``.env`` file in the root of the project with the following
 ```bash
 SUPABASE_URL=https://yoursupabasedb.supabase.co 
 SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
Next, you need to open the linked supabase database, and copy the ```schema.sql``` file into the SQL editor and run the queries to create the table.
The ```schema.sql``` file can be found in the root directory of this repository.

Finally run
 ```npm run start```

Then create a second terminal tab, to hit the API endpoints with ```curl -X```.


# Members API Documentation

A NestJS-based REST API for managing gym/club members with full CRUD operations and relationship tracking capabilities.

## Database Schema

The `members` table structure:

```sql
create table members (
  id SERIAL primary key,
  first_name text not null,
  last_name text not null,
  gender text check (gender in ('male', 'female')),
  birthdate date,
  subscription_date timestamp DEFAULT NOW()
);

alter table members
add column central_member_id int references members(id) on delete set null;
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | SERIAL | Yes | Auto-incrementing primary key |
| `first_name` | TEXT | Yes | Member's first name |
| `last_name` | TEXT | Yes | Member's last name |
| `gender` | TEXT | No | Member's gender ('male' or 'female') |
| `birthdate` | DATE | No | Member's date of birth |
| `subscription_date` | TIMESTAMP | No | Auto-set to current timestamp |
| `central_member_id` | INTEGER | No | Reference to another member (for family/group relationships) |

## API Endpoints

Base URL: `/members`

### Create Member

Creates a new member in the system.

- **Method:** `POST`
- **Endpoint:** `/members/create`
- **Request Body:** `CreateMemberDto`
- **Response:** Created member object

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "gender": "male",
  "birthdate": "1990-01-15",
  "central_member_id": null
}
```

### Get Member by ID

Retrieves a specific member by their ID.

- **Method:** `GET`
- **Endpoint:** `/members/:id`
- **Parameters:** 
  - `id` (string) - Member ID
- **Response:** Member object

### Update Member

Updates an existing member's information.

- **Method:** `PATCH`
- **Endpoint:** `/members/update/:id`
- **Parameters:** 
  - `id` (string) - Member ID
- **Request Body:** `UpdateMemberDto` (partial member data)
- **Response:** Updated member object

```json
{
  "first_name": "Jane",
  "gender": "female"
}
```

### Delete Member

Removes a member from the system.

- **Method:** `DELETE`
- **Endpoint:** `/members/delete/:id`
- **Parameters:** 
  - `id` (string) - Member ID
- **Response:** Deletion confirmation

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Input validation with DTOs
- ✅ Gender constraint validation
- ✅ Automatic subscription date tracking
- ✅ Self-referencing relationships for family/group memberships
- ✅ Cascading delete protection (SET NULL on central_member_id)

## Usage Examples

### Creating a Member
```bash
curl -X POST http://localhost:3000/members/create \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Smith",
    "gender": "female",
    "birthdate": "1985-03-20"
  }'
```

### Getting a Member
```bash
curl -X GET http://localhost:3000/members/1
```

### Updating a Member
```bash
curl -X PATCH http://localhost:3000/members/update/1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alicia"
  }'
```

### Deleting a Member
```bash
curl -X DELETE http://localhost:3000/members/delete/1
```

## Notes
- The `central_member_id` field allows for hierarchical relationships (e.g., family memberships)
- Gender field is optional but restricted to 'male' or 'female' values
- Subscription date is automatically set when a member is created





# Sports API Endpoints

## Base URL
```
/sports
```

## Endpoints

### Create Sport
Creates a new sport in the system.

- **URL:** `/sports/create`
- **Method:** `POST`
- **Body:** `CreateSportDto`
- **Response:** `Sport`

**Example Request:**
```json
POST /sports/create
Content-Type: application/json

{
  "name": "Basketball",
  "subscription_price": 29.99,
  "allowed_gender": "male"
}
```

### Get All Sports
Retrieves all sports from the system.

- **URL:** `/sports/all`
- **Method:** `GET`
- **Response:** `Sport[]`

**Example Request:**
```json
GET /sports/all
```

### Update Sport
Updates an existing sport by ID.

- **URL:** `/sports/update/:id`
- **Method:** `PATCH`
- **URL Parameters:** 
  - `id` (string) - ID of the sport to update
- **Body:** `UpdateSportDto`
- **Response:** `Sport`

**Example Request:**
```json
PATCH /sports/update/123
Content-Type: application/json

{
  "name": "Updated Basketball",
  "subscription_price": 35.00
}
```

### Delete Sport
Deletes a sport by ID.

- **URL:** `/sports/delete/:id`
- **Method:** `DELETE`
- **URL Parameters:** 
  - `id` (string) - ID of the sport to delete
- **Response:** `Sport`

**Example Request:**
```json
DELETE /sports/delete/123
```

## Data Types

### Sport Interface
```typescript
interface Sport {
  id: number;
  name: string;
  subscription_price: number;
  allowed_gender: 'male' | 'female';
}
```

### DTOs
- `CreateSportDto` - Data transfer object for creating sports
- `UpdateSportDto` - Data transfer object for updating sports (partial fields)

## Field Constraints
- `name` - Required text field
- `subscription_price` - Numeric value for subscription cost
- `allowed_gender` - Must be either 'male' or 'female'

## Notes
- All endpoints return JSON responses
- The `id` parameter is a serial integer (auto-incrementing)
- The frontend should pass the sport ID (from database) to the update/delete endpoints



# Subscriptions API Documentation

## Database Schema

The `subscriptions` table structure:

```sql
create table subscriptions (
  member_id int references members(id) on delete cascade,
  sport_id int references sports(id) on delete cascade,
  type text check (type in ('group', 'private')),
  primary key (member_id, sport_id) -- Prevent duplicates
);
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `member_id` | INTEGER | Yes | Foreign key reference to members table |
| `sport_id` | INTEGER | Yes | Foreign key reference to sports table |
| `type` | TEXT | No | Subscription type ('group' or 'private') |

### Key Features
- **Composite Primary Key:** Prevents duplicate subscriptions (one member per sport)
- **Cascade Delete:** Automatically removes subscriptions when member or sport is deleted
- **Type Constraint:** Subscription type restricted to 'group' or 'private'

## API Endpoints

Base URL: `/subscriptions`

### Subscribe Member

Subscribes a member to a sport or activity.

- **Method:** `POST`
- **Endpoint:** `/subscriptions/subscribe`
- **Request Body:** `SubscribeMemberDto`
- **Response:** Subscription confirmation object

**Request Body Example:**
```json
{
  "member_id": 1,
  "sport_id": 3,
  "type": "group"
}
```

**Response Example:**
```json
{
  "member_id": 1,
  "sport_id": 3,
  "type": "group",
  "message": "Member successfully subscribed"
}
```

### Unsubscribe Member

Removes a member's subscription from a sport or activity.

- **Method:** `DELETE`
- **Endpoint:** `/subscriptions/unsubscribe`
- **Request Body:** `UnsubscribeMemberDto`
- **Response:** Unsubscription confirmation object

**Request Body Example:**
```json
{
  "member_id": 1,
  "sport_id": 3
}
```

**Response Example:**
```json
{
  "message": "Member successfully unsubscribed",
  "member_id": 1,
  "sport_id": 3
}
```

## Features

- ✅ Member subscription management
- ✅ Sport/activity enrollment
- ✅ Input validation with DTOs
- ✅ Subscription tracking
- ✅ Clean unsubscribe process

## Usage Examples

### Subscribing a Member
```bash
curl -X POST http://localhost:3000/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 1,
    "sport_id": 2,
    "type": "group"
  }'
```

### Unsubscribing a Member
```bash
curl -X DELETE http://localhost:3000/subscriptions/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 1,
    "sport_id": 2
  }'
```

## Data Transfer Objects (DTOs)

### SubscribeMemberDto
Expected fields for subscribing a member:
- `member_id` (number) - ID of the member to subscribe
- `sport_id` (number) - ID of the sport/activity
- `type` (string) - Subscription type ('group' or 'private')

### UnsubscribeMemberDto
Expected fields for unsubscribing a member:
- `member_id` (number) - ID of the member to unsubscribe
- `sport_id` (number) - ID of the sport/activity

## Notes

- Both endpoints use request body data instead of URL parameters for flexibility
- The DELETE method is used for unsubscribe but still accepts a request body
- Integer IDs are used for member_id and sport_id references
- Composite primary key prevents duplicate subscriptions (one member per sport)
- Cascade delete automatically removes subscriptions when referenced member or sport is deleted
- Subscription type is constrained to 'group' or 'private' sessions
- No separate subscription ID exists; the combination of member_id and sport_id serves as the unique identifier

## Related APIs

This subscription system works in conjunction with:
- **Members API** - For managing member data
- **Sports API** - For managing available sports and activities

## Error Handling

Common error scenarios:
- Invalid member_id or sport_id (integer format required)
- Member already subscribed to the sport (duplicate subscription)
- Member not currently subscribed (for unsubscribe operations)
- Invalid subscription type (must be 'group' or 'private')
- Missing required fields in request body
- Referenced member or sport does not exist
