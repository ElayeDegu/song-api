const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

// Connect to MongoDB
mongoose.connect("mongodb+srv://username:<Your Password>@song.kvbc3pc.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Define a schema for our data model
const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
  genre: { type: String, required: true },
});

// Create a model for the song
const Song = mongoose.model("Song", songSchema);
app.use(cors());
// Middleware to parse JSON
app.use(express.json());

// Routes
// Get all songs
app.get("/songs", async (req, res) => { 
    try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get song by ID
app.get("/songs/:id", async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);
      if (!song) throw new Error("Song not found");
      res.send(song);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

// Create a new song
app.post('/songs', async (req, res) => {
    // Destructure required fields from the request body
     const { title, artist, album, genre } = req.body;
   
     // Check if all required fields are present
     if (!title || !artist || !album || !genre) {
       return res.status(400).json({ message: 'Missing required fields' });
     }
   
     // Create a new Song instance
     const song = new Song({ title, artist, album, genre });
   
     try {
       // Save the song to the database
       await song.save();
       res.status(201).json({ message: 'Song created!', data: song });
     } catch (error) {
       // If there's an error, send a 500 status and the error message
       res.status(500).json({ message: 'Error creating song', error });
     }
   });

// Update song by ID
app.put('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
 );

    if (!song) {
 return res.status(404).json({ message: 'Song not found' });
    }

    res.json({ message: 'Song updated!', data: song });
  } catch (error) {
    res.status(500).json({ message: 'Error updating song', error });
  }
});

// Delete song by ID
app.delete("/songs/:id", async (req, res) => {
    try {
      const song = await Song.findByIdAndDelete(req.params.id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      res.json({ message: "Song deleted!", data: song });
    } catch (err) {
      res.status(500).json({ message: "Error deleting song", error: err.message });
    }
  });

// Get overall statistics
app.get("/stats", async (req, res) => {
  const stats = {
    totalSongs: await Song.countDocuments(),
    totalArtists: await Song.distinct("artist").length,
    totalAlbums: await Song.distinct("album").length,
    totalGenres: await Song.distinct("genre").length,
    songsPerGenre: await Song.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
    ]),
    songsPerAlbum: await Song.aggregate([
      { $group: { _id: "$album", count: { $sum: 1 } } },
    ]),
    songsPerArtist: await Song.aggregate([
      { $group: { _id: "$artist", count: { $sum: 1 } } },
    ]),
  };
  res.json(stats);
});


// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
