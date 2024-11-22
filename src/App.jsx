import React, { useState, useEffect } from "react";
import { database } from "./firebase"; // Import Firebase setup
import { ref, set, push, onValue, remove, update } from "firebase/database";
import Swal from "sweetalert2"; // Import SweetAlert
import "./App.css";

function App() {
  const [formData, setFormData] = useState({ name: "", class: "", mark: "" });
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null); // Track editing state

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.class || !formData.mark) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text: "Please fill out all fields before submitting.",
      });
      return;
    }

    const studentRef = ref(database, "students");

    if (editId) {
      // Update existing student
      const studentUpdateRef = ref(database, `students/${editId}`);
      update(studentUpdateRef, formData).then(() => {
        Swal.fire({
          icon: "success",
          title: "Student Updated",
          text: "The student record has been successfully updated!",
        });
        setEditId(null);
        setFormData({ name: "", class: "", mark: "" }); // Clear form
      });
    } else {
      // Add new student
      const newStudentRef = push(studentRef);
      set(newStudentRef, formData).then(() => {
        Swal.fire({
          icon: "success",
          title: "Student Added",
          text: "The student record has been successfully added!",
        });
        setFormData({ name: "", class: "", mark: "" }); // Clear form
      });
    }
  };

  // Fetch data from the database
  useEffect(() => {
    const studentRef = ref(database, "students");
    onValue(studentRef, (snapshot) => {
      const data = snapshot.val();
      const studentList = data
        ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
        : [];
      setStudents(studentList);
    });
  }, []);

  // Handle delete operation with confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this student record? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const studentRef = ref(database, `students/${id}`);
        remove(studentRef).then(() => {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "The student record has been deleted successfully.",
          });
        });
      }
    });
  };

  // Handle edit operation
  const handleEdit = (student) => {
    setEditId(student.id);
    setFormData({ name: student.name, class: student.class, mark: student.mark });
  };

  return (
    <div className="App">
      <h1>Firebase Realtime Database Read & Write</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="class"
          placeholder="Class"
          value={formData.class}
          onChange={handleChange}
        />
        <input
          type="number"
          name="mark"
          placeholder="Mark"
          value={formData.mark}
          onChange={handleChange}
        />
        <button type="submit">{editId ? "Update Student" : "Add Student"}</button>
      </form>

      <h2>Student List</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Mark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.class}</td>
              <td>{student.mark}</td>
              <td className="flex">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(student)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(student.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
