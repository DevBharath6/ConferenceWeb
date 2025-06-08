import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Switch,
  Paper,
  Grid,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../services/api";

const NavbarManager = () => {
  const [navItems, setNavItems] = useState([]);
  const [newItem, setNewItem] = useState({
    title: "",
    url: "",
    order: 0,
    visible: true,
  });
  const [childInputs, setChildInputs] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    api
      .get("/navbar")
      .then((res) => setNavItems(res.data))
      .catch((err) => console.error("Failed to load navbar items", err));
  };

  const toggleVisibility = async (item) => {
    try {
      await api.patch(`/navbar/${item._id}`, {
        visible: !item.visible,
      });
      fetchItems();
    } catch (err) {
      console.error("Visibility toggle failed", err);
    }
  };

  const handleAdd = () => {
    if (!newItem.title.trim() || !newItem.url.trim()) {
      alert("Title & URL are required");
      return;
    }
    api
      .post("/navbar", newItem)
      .then(() => {
        fetchItems();
        setNewItem({ title: "", url: "", order: 0, visible: true });
      })
      .catch((err) => console.error("Add failed", err));
  };

  const editParentItem = async (item) => {
    const newTitle = prompt("New title:", item.title);
    if (!newTitle || !newTitle.trim()) return;
    const newUrl = prompt("New URL:", item.url);
    if (!newUrl || !newUrl.trim()) return;
    const newOrder = prompt("New order:", item.order);
    if (newOrder === null) return;

    try {
      await api.patch(`/navbar/${item._id}`, {
        title: newTitle.trim(),
        url: newUrl.trim(),
        order: parseInt(newOrder) || 0,
      });
      fetchItems();
    } catch (err) {
      console.error("Edit parent item failed", err);
    }
  };

  const deleteParentItem = async (itemId) => {
    if (!window.confirm("Delete this navbar item and all its children?")) return;

    try {
      const response = await api.delete(`/navbar/${itemId}`);
      if (response.status === 200) {
        fetchItems();
      } else {
        alert("Failed to delete navbar item");
      }
    } catch (err) {
      console.error("Delete parent item failed", err);
      alert("Failed to delete navbar item: " + (err.response?.data?.message || err.message));
    }
  };

  const handleChildInputChange = (parentId, field, value) => {
    setChildInputs((prev) => ({
      ...prev,
      [parentId]: {
        ...prev[parentId],
        [field]: value,
      },
    }));
  };

  const addChild = async (parentId) => {
    const input = childInputs[parentId];
    if (!input || !input.title?.trim() || !input.url?.trim()) {
      alert("Child title & URL required");
      return;
    }

    try {
      await api.post(`/navbar/${parentId}/children`, {
        title: input.title.trim(),
        url: input.url.trim(),
        order: input.order ? parseInt(input.order) : 0,
        visible: input.visible !== undefined ? input.visible : true,
      });
      setChildInputs((prev) => ({ ...prev, [parentId]: {} }));
      fetchItems();
    } catch (err) {
      console.error("Add child failed", err);
    }
  };

  const editChild = async (parentId, child) => {
    const newTitle = prompt("New child title:", child.title);
    if (!newTitle || !newTitle.trim()) return;
    const newUrl = prompt("New child URL:", child.url);
    if (!newUrl || !newUrl.trim()) return;

    try {
      await api.patch(`/navbar/${parentId}/children/${child._id}`, {
        title: newTitle.trim(),
        url: newUrl.trim(),
      });
      fetchItems();
    } catch (err) {
      console.error("Edit child failed", err);
    }
  };

  const deleteChild = async (parentId, childId) => {
    if (!window.confirm("Delete this child?")) return;

    try {
      const response = await api.delete(`/navbar/${parentId}/children/${childId}`);
      if (response.status === 200) {
        fetchItems();
      } else {
        alert("Failed to delete child item");
      }
    } catch (err) {
      console.error("Delete child failed", err);
      alert("Failed to delete child item: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleChildVisibility = async (parentId, childId, currentVisibility) => {
    try {
      await api.patch(`/navbar/${parentId}/children/${childId}`, {
        visible: !currentVisibility,
      });
      fetchItems();
    } catch (err) {
      console.error("Toggle child visibility failed", err);
    }
  };

  return (
    <Box
      p={4}
      sx={{
        marginLeft: "220px",
        transition: "margin-left 0.3s ease",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" fontWeight="700" mb={4} textAlign="center">
        Navbar Manager
      </Typography>

      {/* Add New Item */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 5,
          maxWidth: 700,
          mx: "auto",
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" fontWeight="600" mb={2}>
          Add New Navbar Item
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="Title"
            variant="outlined"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="URL"
            variant="outlined"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Order"
            type="number"
            variant="outlined"
            value={newItem.order}
            onChange={(e) =>
              setNewItem({ ...newItem, order: parseInt(e.target.value) || 0 })
            }
            size="small"
            sx={{ maxWidth: 100 }}
          />
          <Button variant="contained" size="large" onClick={handleAdd}>
            Add
          </Button>
        </Stack>
      </Paper>

      {/* Existing Nav Items */}
      <Grid container spacing={4} justifyContent="center">
        {navItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={5} key={item._id}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "white",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                },
                maxWidth: "100%",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: item.visible ? "none" : "line-through",
                    color: item.visible ? "text.primary" : "text.disabled",
                    fontWeight: 700,
                  }}
                >
                  {item.title}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => editParentItem(item)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteParentItem(item._id)}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={1}
                sx={{ fontStyle: "italic" }}
              >
                URL: {item.url}
              </Typography>
              <Typography variant="body2" mb={2}>
                Order: {item.order}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Switch
                  checked={item.visible}
                  onChange={() => toggleVisibility(item)}
                  color="primary"
                />
                <Typography variant="body2">
                  Visible: {item.visible ? "Yes" : "No"}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Children Section */}
              <Typography variant="subtitle1" fontWeight="600" mb={1}>
                Dropdown Items
              </Typography>

              {item.children && item.children.length > 0 ? (
                item.children
                  .sort((a, b) => a.order - b.order)
                  .map((child) => (
                    <Stack
                      key={child._id}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                      sx={{
                        padding: 1,
                        borderRadius: 1,
                        backgroundColor: "#f5f5f5",
                        textDecoration: child.visible ? "none" : "line-through",
                        color: child.visible ? "inherit" : "text.disabled",
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          {child.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {child.url}
                        </Typography>
                      </Box>

                      <Switch
                        checked={child.visible}
                        onChange={() =>
                          toggleChildVisibility(item._id, child._id, child.visible)
                        }
                        color="primary"
                        size="small"
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => editChild(item._id, child)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteChild(item._id, child._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontStyle="italic"
                  mb={2}
                >
                  No dropdown items added yet.
                </Typography>
              )}

              {/* Add New Child */}
              <Box mt={3}>
                <Typography variant="subtitle2" fontWeight="600" mb={1}>
                  Add New Dropdown Item
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <TextField
                    label="Child Title"
                    size="small"
                    value={childInputs[item._id]?.title || ""}
                    onChange={(e) =>
                      handleChildInputChange(item._id, "title", e.target.value)
                    }
                    sx={{ flexGrow: 1, minWidth: 140 }}
                  />
                  <TextField
                    label="Child URL"
                    size="small"
                    value={childInputs[item._id]?.url || ""}
                    onChange={(e) =>
                      handleChildInputChange(item._id, "url", e.target.value)
                    }
                    sx={{ flexGrow: 1, minWidth: 140 }}
                  />
                  <TextField
                    label="Order"
                    type="number"
                    size="small"
                    value={childInputs[item._id]?.order || ""}
                    onChange={(e) =>
                      handleChildInputChange(item._id, "order", e.target.value)
                    }
                    sx={{ width: 80 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => addChild(item._id)}
                  >
                    Add Child
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NavbarManager;
