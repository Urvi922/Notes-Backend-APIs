I built a notes API using NodeJS with ExpressJS and MongoDB as the database. I selected NodeJS and MongoDB because I have experience working with them, it allowed me to efficiently and quickly develop the backend of the notes application.

I other than that I have used bcryptjs to hash the password before saving for security reasons. I have used Jest for creating test cases because it is useful in creating both unit test and integrations test.

The 'Assessment' zip code contains all the required dependencies so follow the below instructions to run the code: 

1. Open the project in VS code.
2. Run 'npm install' command in terminal.
3. Run 'npm start' in VS code in root folder.
4. Once the environment is running use can test the API's using Postman.

You can access postman collection of API from 'Assessment.postman_collection' zip file.

To run unit test follow below steps: 
1. Move to root folder of the project
2. Run 'npx jest /tests/noteController.test.js' command in the terminal to run noteController test file.
3. Run 'npx jest /tests/note.test.js' command in the terminal to run note test file.
