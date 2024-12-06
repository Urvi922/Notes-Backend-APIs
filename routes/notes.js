const express = require('express');
const noteController = require('../controllers/noteController');

const isAuthenticated = require('../middleware/is-auth');

const router = express.Router();

//Create note API
router.post('/createnote', isAuthenticated, noteController.createNote);

//Update note API
router.put('/updatenote/:id', isAuthenticated, noteController.updateNote);

//Delete note API
router.delete('/deletenote/:id', isAuthenticated, noteController.deleteNote);

//Get all notes API
router.get('/getnotes', isAuthenticated, noteController.getNotes);

//Get note by Id API
router.get('/getnotebyid/:id', isAuthenticated, noteController.getNotebyId);

//Share note with user API
router.post('/sharenote/:id/share', isAuthenticated, noteController.shareNote);

//Search note with keyword API
router.get('/search', isAuthenticated, noteController.searchNotebyKW);

module.exports = router;