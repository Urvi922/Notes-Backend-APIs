const request = require('supertest');
const app = require('../App');
const Note = require('../models/noteModel');
const { connect, disconnect } = require('./testMiddleware');
const User = require('../models/userModel');

let cookie;
let testNote;

describe('Note API Integration Tests', () => {
    beforeAll(async () => {
        await connect();
    });


    afterAll(async () => {
        await disconnect();
    });
    
    // setup to authneticate user
    describe('Login', () => {
        it('should log in the user', async () => {
   
            // Login and get the token
            const res = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: "testuser2@example.com",
                    password: "password12345"
                })
                .expect(200);

            const cookies = res.headers['set-cookie'];

            // store the session cookie for later use
            const sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid'));  

            // store the cookie for future requests
            cookie = sessionCookie;
        });
    });
    
    // testing create note api with authenticated user
    describe('createNote', () => {
        it('create a new post when the user is authenticated', async () => {

            const postData = { title: 'test note', content: 'test note' };

            // use the token to authenticate the request to create a post
            const res = await request(app)
                .post('/api/notes/createnote')
                .set('Content-Type', 'application/json')
                .set('Cookie', cookie)
                .send(postData)
                .expect(201); 


            // check if the post was created correctly
            const note = await Note.findById(res.body.data.noteId);
            expect(note.title).toBe('test note');
            expect(note.content).toBe('test note');
            
            //store note for future use
            testNote = note;
        });
    });

    //testing update note api with authneticated user
    describe('updateNote', () => {
        it('update post when the user is authenticated', async () => {
            console.log('note created', testNote);

            const noteId = testNote._id
            const postData = { title: 'update note', content: 'update note' };
            
            // use the token to authenticate the request to create a post
            const res = await request(app)
                .put(`/api/notes/updatenote/${noteId}`)
                .set('Content-Type', 'application/json')
                .set('Cookie', cookie)
                .send(postData)
                .expect(200); // Check if status is 201 (Created)


            // check if the post was created correctly
            const note = await Note.findById(res.body.data.noteId);
            expect(note.title).toBe('update note');
            expect(note.content).toBe('update note');
        });
    });



});

