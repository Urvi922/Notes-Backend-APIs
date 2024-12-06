const Note = require('../models/noteModel');
const retRresp = require('../Utils/Response');


// Create Note API 
exports.createNote = async (req, res) => {
    // get data from the user
    const { title, content } = req.body;

    try {
        // create a note for the logged-in user
        const note = new Note({
            title: title,
            content: content,
            user: req.session.user
        });

        // save the note to the database
        const savedNote = await note.save();
        

        retRresp(res, 201,'Note created successfully!', {
            noteId: savedNote._id,
            title: savedNote.title,
            content: savedNote.content,
            createdAt: savedNote.createdAt,
        });
      

    } catch (err) {
        console.error(err);
        retRresp(res, 500, 'Error creating note', err.message );
    }
};


// Update Note API
exports.updateNote = async (req, res) => {
    //get data form user
    const { title, content } = req.body;

    try {        
        // find the note by getting id from params and update the note
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            {
                title: title,
                content: content,
                updatedAt: Date.now()
            },
            {
                new: true
            }
        );


        if (!note) {
            // return res.status(404).json({ message: 'Note not found!' });
            return retRresp(res, 404, 'Note not found!');
            
        }

        retRresp(res, 200, 'Note updated successfully!', {
            noteId: note._id,
            title: note.title,
            content: note.content,
            updatedAt: note.updatedAt,
        });

    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Note not found', err.message );
    }
};

//Delete Note API
exports.deleteNote = async (req, res) => {
    
    try {
        //find note by id and delete
        const note = await Note.findByIdAndDelete({
            _id: req.params.id,
            user: req.session.user
        });
        if (!note) {
            return retRresp(res, 404, 'Note not found');
        }

        retRresp(res, 200, 'Note deleted successfully!');
        
    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Unable to delete note', err.message );
    }
};

// Get All Note of Logged In User
exports.getNotes = async (req, res) => {
    try {
        // get all note of the logged in user
        const notes = await Note.find({ 
            $or: [
                {user: req.session.user._id},
                {sharedWith: req.session.user._id}
            ]
         }).populate('user', 'name email');

        // filter data to display
        const notesToShow = notes.map(note => {
            if(note.user._id.toString() === req.session.user._id.toString()) {
                return {
                    // note data when user created it
                    noteId: note._id,
                    title: note.title,
                    content: note.content,
                };
            } else {
                return {
                    // note data with user name who shared it 
                    noteId: note._id,
                    title: note.title,
                    content: note.content,
                    user: {
                        sharedBy: note.user.name
                    }
                };
            }
        });

        retRresp(res, 200, 'All note for user retrived successfully!', { notes: notesToShow });

    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Unable to fetch notes', err.message );
    }
};

// Get Note by Id API
exports.getNotebyId = async (req, res) => {
    // get note id from paramaters 
    const noteId =  req.params.id;
  
    try {
        //find note from databse by id
        const note = await Note.findById(noteId);
        console.log(note);
        if (!note) {
            return retRresp(res, 404, 'Note not found');
        }
         
        retRresp(res, 200, 'Note retrived successfully!', {
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        });

    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Note not found', err.message );
    }
};

//Share note API
exports.shareNote = async (req, res) => {
    // get note id to shre and user id to share with
    const noteId = req.params.id;
    const userIdToShare = req.body.userId;

    // check if user id is valid
    if (!userIdToShare) {
        retRresp(res, 400, 'Invalid user Id');
    }

    //check if note is present
    if(!noteId) {
        retRresp(res, 400, 'Invalid note Id');
    }

    try {
        const note = await Note.findOne({
            _id: noteId,
            user: req.session.user._id
        });

        if(!note) {
            return retRresp(res, 404, 'Do not have permission to share note');
        }

        if(note.sharedWith && note.sharedWith.includes(userIdToShare)) {
            return retRresp(res, 400, 'Note is already shared with this user');
        }
         
        // add user to sharewith list
        note.sharedWith = note.sharedWith || [];
        note.sharedWith.push(userIdToShare);

        await note.save();

        retRresp(res, 200, 'Note shared successsfully!', {title: note.title,
         content: note.content,
         user: note.user,
         sharedWith: note.sharedWith
        });

    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Failed to share note with this user', err.message );
    }
};

//Search note by keyword API
exports.searchNotebyKW = async (req, res) => {
    const searchQuery = req.query.q;
   
    if(!searchQuery) {
        return retRresp(res, 500, 'Keyword is required');
    }

    try {
        const notes = await Note.find({ 
            $text: { $search: searchQuery },
            $or: [
                {user: req.session.user._id},
                {sharedWith: req.session.user._id}
            ]
        }).populate('user', 'name email');

        // filter data to display
        const notesToShow = notes.map(note => {
            if(note.user._id.toString() === req.session.user._id.toString()) {
                return {
                    // note data when user created it
                    noteId: note._id,
                    title: note.title,
                    content: note.content,
                };
            } else {
                return {
                    // note data with user name who shared it 
                    noteId: note._id,
                    title: note.title,
                    content: note.content,
                    user: {
                        sharedBy: note.user.name
                    }
                };
            }
        });

        retRresp(res, 200, 'Notes retrived successfully!', { notes: notesToShow });
        
    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'No notes found', err.message );
    }

};


