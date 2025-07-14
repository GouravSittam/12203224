import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import UrlShortenerPage from "./pages/UrlShortenerPage";
import StatisticsPage from "./pages/StatisticsPage";

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/shorten">
            Shorten URLs
          </Button>
          <Button color="inherit" component={Link} to="/stats">
            Statistics
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ minHeight: "80vh" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/shorten" replace />} />
            <Route path="/shorten" element={<UrlShortenerPage />} />
            <Route path="/stats" element={<StatisticsPage />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
