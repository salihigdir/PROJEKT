const express = require("express");
const cors = require("cors");
const path = require("path");

const printerRoutes = require("./routes/printerRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Frontend dosyalarını yayınla
app.use(express.static(path.join(__dirname, "../frontend")));

// API test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API çalışıyor",
    status: "OK"
  });
});

// Printer route
app.use("/api/printers", printerRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
