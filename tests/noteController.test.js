const noteController = require('../controllers/noteController');
const Note = require('../models/noteModel');
const { connect, disconnect } = require('./testMiddleware');

jest.mock('../models/noteModel');

describe('Note Controller', () => {
    // mock user 
    const mockUser = { _id: 'user1', name: 'user1'};

    //mock note
    const mockNote = {
        _id: "1",
        title: "unit test",
        content: "unit test",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        user: mockUser._id,
        sharedWith: [],
        save: jest.fn().mockResolvedValue(true)
    };


    beforeAll( async() => {
        await connect();
    });
  
    afterAll(async() => {
        await disconnect();
    });

    // testing get note by id
    describe('getNoteById', () => {
        it('return a note by ID if it exists', async () => {
            
            //mock the find by id method 
            Note.findById = jest.fn().mockResolvedValue(mockNote);

            const req = { 
                params: { id: '1'},
                session: {user: { _id: 'user1'} }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.getNotebyId(req, res);

            //assertions
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Note retrived successfully!',
                data: {
                    title: mockNote.title,
                    content: mockNote.content,
                    createdAt: mockNote.createdAt,
                    updatedAt: mockNote.updatedAt
                }
            });
        });
    })

    //testing creating note by user 
    describe('createNote', () => {
        it('create a note for authenticated user', async () => {

            // mock the save method 
            Note.prototype.save = jest.fn().mockResolvedValue(mockNote);

            const req = {
                body: {
                    title: 'unit test',
                    content: 'unit test'
                },
                session: { user: { _id: 'user1' } }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.createNote(req, res);

            // assertions
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Note created successfully!", 
                data: {
                    noteId: mockNote._id,
                    title: mockNote.title,
                    content: mockNote.content,
                    createdAt: mockNote.createdAt,
                }   
            });
            
        });
    })

    //testing update note by user
    describe('updateNote', () => {
        it('update a note for authenticated user', async () => {
         
            // mock the save method 
            Note.findByIdAndUpdate = jest.fn().mockResolvedValue(mockNote);

            const req = {
                params: { id: '1' },
                body: {
                    title: 'unit test',
                    content: 'unit test'
                },
                session: { user: { _id: 'user1' } }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.updateNote(req, res);

            // assertions
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Note updated successfully!", 
                data: {
                    noteId: mockNote._id,
                    title: mockNote.title,
                    content: mockNote.content,
                    updatedAt: mockNote.updatedAt
                } 
            }); 
        });
    })

    //testing delete note by user
    describe('deleteNote', () => {
        it('delete a note for authenticated user', async () => {
         
            // mock the save method 
            Note.findByIdAndDelete = jest.fn().mockResolvedValue(mockNote);

            const req = {
                params: { id: '1' },
                session: { user: { _id: 'user1' } }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.deleteNote(req, res);

            // assertions
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Note deleted successfully!"
            }); 
        });
    })

    //testing get notes of logged in user
    describe('getNotes', () => {
        it('return all notes of logged in user', async () => {
            // mock user
            const mockUser = { _id: 'user1', name: 'user1', email: 'user1@example.com' };

            // mock notes
            const mockNotes = [
                {
                    _id: 'note1',
                    title: 'Shared Note 1',
                    content: 'Content of shared note 1',
                    user: { _id: 'user2', name: 'user2' },
                    sharedWith: ['user1'], 
                },
                {
                    _id: 'note2',
                    title: 'User Note 2',
                    content: 'Content of user1 note 2',
                    user: { _id: 'user1', name: 'user1' },
                    sharedWith: [],
                },
            ]

            //mock the find method to find all the notes
            Note.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockNotes)
            });

            const req = {
                session: {
                    user: mockUser
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.getNotes(req, res);

            //filter teh notes 
            const filteredNotes = [
                {
                    noteId: 'note1',
                    title: 'Shared Note 1',
                    content: 'Content of shared note 1',
                    user: {
                        sharedBy: 'user2'
                    }
                },
                {
                    noteId: 'note2',
                    title: 'User Note 2',
                    content: 'Content of user1 note 2',
                }
            ];

            // assertions
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'All note for user retrived successfully!',
                data: { notes: filteredNotes }
            });

        });
    })

    //testing share notes by user
    describe('shareNotes', () => {
        it('share note by id with given user', async () => {
            const testNote = JSON.parse(JSON.stringify(mockNote));
            testNote.save = jest.fn().mockResolvedValue(true);
            
            // mock find note method 
            Note.findOne = jest.fn().mockResolvedValue(testNote);

            const req = {
                params: {id: '1'},
                body: { user: 'user2' },
                session: { user: mockUser }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.shareNote(req, res);

            expect(testNote.save).toHaveBeenCalled();

            // assertions
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Note shared successsfully!",
                data: {
                    title: testNote.title,
                    content: testNote.content,
                    user: testNote.user,
                    sharedWith: testNote.sharedWith
                }
            }); 

        });
    })

    //testing searching by keywords
    describe('shareNotes', () => {
        it('share note by id with given user', async () => {
            // mock user
            const mockUser = { _id: 'user1', name: 'user1', email: 'user1@example.com' };

            // mock notes
            const mockNotes = [
                {
                    _id: 'note1',
                    title: 'Shared Note 1',
                    content: 'Content of shared note 1',
                    user: { _id: 'user2', name: 'user2' },
                    sharedWith: ['user1'], 
                },
                {
                    _id: 'note2',
                    title: 'User Note 2',
                    content: 'Content of user1 note 2',
                    user: { _id: 'user1', name: 'user1' },
                    sharedWith: [], 
                },
            ];

            // mock find by keyword method
            Note.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockNotes)
            });

            const req = {
                query: { q: 'test' },
                session: { user: mockUser }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await noteController.searchNotebyKW(req, res);

            expect(Note.find).toHaveBeenCalledWith({
                $text: { $search: 'test' },
                $or: [
                    { user: 'user1' },
                    { sharedWith: 'user1' }
                ]
            });

            const expectedNotes = [
                {
                    noteId: 'note1',
                    title: 'Shared Note 1',
                    content: 'Content of shared note 1',
                    user: {
                        sharedBy: 'user2'
                    }
                },
                {
                    noteId: 'note2',
                    title: 'User Note 2',
                    content: 'Content of user1 note 2',
                }
            ];

            // assertions
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notes retrived successfully!',
                data: { notes: expectedNotes }
            });
        });
    })

});