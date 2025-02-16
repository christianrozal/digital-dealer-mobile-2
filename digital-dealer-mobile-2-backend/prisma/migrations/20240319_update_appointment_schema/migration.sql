-- Drop the existing appointments table since it's empty
DROP TABLE IF EXISTS "appointments";

-- Create the new appointments table with the updated schema
CREATE TABLE "appointments" (
    "id" SERIAL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "user_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "dealership_brand_id" INTEGER NOT NULL,
    "dealership_department_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users"("id"),
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id"),
    FOREIGN KEY ("dealership_brand_id") REFERENCES "dealership_brands"("id"),
    FOREIGN KEY ("dealership_department_id") REFERENCES "dealership_departments"("id")
); 