# Server-Rendered E-commerce Dashboard

A robust, server-side rendered admin dashboard built with **Next.js 16**, **MongoDB**, **Tailwind CSS**, and **Shadcn/ui**.

## Features

- **Performance**: Server-Side Rendering (SSR) for fast load times and SEO.
- **Authentication**: Secure admin login using NextAuth.js.
- **Product Management**: Full CRUD operations with secure image upload (Cloudinary).
- **Dashboard**: Real-time sales and stock analytics using Recharts.
- **Admin Management**: Secure onboarding for new administrators.
- **Design**: Premium, responsive UI with dark/light mode support capability.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB (Mongoose)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Auth**: NextAuth.js
- **Validation**: Zod + React Hook Form
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Running locally on port 27017 or a cloud URI)

### Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Update `.env.local` with your credentials:
    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce-admin
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

3.  **Seed Database (Important)**:
    Start the server and visit the seed endpoint to create the first admin.
    ```bash
    npm run dev
    ```
    Open your browser to: `http://localhost:3000/api/seed`

    **Default Credentials**:
    - Email: `admin@example.com`
    - Password: `admin123`

4.  **Access Dashboard**:
    Navigate to `http://localhost:3000` and log in.

## Project Structure

- `/app`: Next.js App Router pages and API routes.
- `/components`: Reusable UI components and forms.
- `/lib`: Database and authentication utilities.
- `/lib/models`: Mongoose schemas.
