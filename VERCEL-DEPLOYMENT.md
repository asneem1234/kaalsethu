# Deploying Time Capsule to Vercel

This guide provides detailed steps to deploy your Time Capsule project on Vercel's platform.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (you can sign up with GitHub, GitLab, or email)
2. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Node.js version 18 or higher (as specified in package.json)

## Environment Variables Setup

Before deploying, you'll need to gather all your environment variables:

- `MONGO_URI`: Your MongoDB connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Secret for JWT authentication
- `AZURE_STORAGE_CONNECTION_STRING`: If using Azure Blob Storage
- `AZURE_CONTAINER_NAME`: If using Azure Blob Storage
- Any other environment variables your application uses

## Deployment Steps

### 1. Push Your Code to a Git Repository

Ensure your code (including the changes we've made) is pushed to GitHub, GitLab, or Bitbucket.

### 2. Import Your Project in Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Select the Git provider where your repository is hosted
4. Find and select your Time Capsule repository
5. Vercel will automatically detect that this is a Node.js project

### 3. Configure Project Settings

In the project configuration screen:

1. **Project Name**: You can keep the default or change it
2. **Framework Preset**: Select "Other" if not automatically detected
3. **Root Directory**: Keep as `.` unless your project is in a subdirectory
4. **Build Command**: Vercel will use the `build` script from package.json
5. **Output Directory**: Leave as default (usually `public`)
6. **Install Command**: Leave as default (`npm install` or `yarn install`)

### 4. Configure Environment Variables

1. Expand the "Environment Variables" section
2. Add all the environment variables listed in the prerequisites section
3. Make sure to set them for Production, Preview, and Development environments as needed

### 5. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Once deployed, you'll get a URL where your application is live

### 6. Verify Deployment

1. Visit your deployment URL to make sure the frontend is working
2. Test your API endpoints using a tool like Postman or by using your application interface

### 7. Connect a Custom Domain (Optional)

1. In your project dashboard, go to "Settings" > "Domains"
2. Add your custom domain and follow the verification steps

## Troubleshooting

If you encounter issues during deployment:

1. **Check Build Logs**: From your project dashboard, click on the latest deployment to view detailed logs
2. **Check Environment Variables**: Ensure all required variables are correctly set
3. **Database Connection**: Make sure your MongoDB URI is correct and that your database allows connections from Vercel's IP range
4. **File Paths**: If files aren't found, you might need to adjust paths in your code

## Vercel Serverless Function Limitations

Keep in mind:

1. **Execution Timeout**: Vercel serverless functions have a maximum execution time of 10 seconds on the Hobby plan
2. **Body Size Limit**: There's a 4.5MB payload size limit
3. **Memory Limit**: Serverless functions have limited memory (1GB on Hobby plan)

If your application exceeds these limits, you might need to optimize it or consider upgrading to a paid plan.

## Monitoring and Logs

After deployment:

1. Use the Vercel dashboard to monitor your application
2. Check "Functions" tab to see serverless function metrics
3. Review logs for debugging errors

## Auto Deployments

Vercel automatically deploys when you push changes to your repository's default branch. You can customize this behavior in the project settings.