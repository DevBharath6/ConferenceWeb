import React from "react";
import { Box, Container } from "@mui/material";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => (
  <Box>
    <Header />
    <Navbar />
    <Container sx={{ minHeight: "80vh", mt: 2 }}>
      {children}
    </Container>
    <Footer />
  </Box>
);

export default MainLayout;
