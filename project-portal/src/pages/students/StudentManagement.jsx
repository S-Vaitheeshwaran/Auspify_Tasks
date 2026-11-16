import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Users,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import "./StudentManagement.css";

const emptyStudent = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  department: "",
  address: "",
};

// Returns today's date in local YYYY-MM-DD format.
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// @Past rejects today as well as future dates, so the maximum
// selectable date is yesterday.
const getMaxDateOfBirth = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(emptyStudent);
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getResponseData = (response) => response.data?.paramObjectsMap || {};

  const getErrorMessage = (err) =>
    err.response?.data?.errors?.[0]?.details ||
    err.response?.data?.errors?.[0]?.message ||
    err.response?.data?.message ||
    err.response?.data?.detail ||
    err.response?.data?.error ||
    err.message ||
    "Something went wrong. Please try again.";

  // Load all students.
  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/student/getAllStudents");
      const data = getResponseData(response);
      setStudents(data.students || []);
    } catch (err) {
      console.error("Error loading students:", err);
      setError(getErrorMessage(err) || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Validate all fields on the client before calling the API.
  const validateStudent = (student) => {
    const errors = {};

    const namePattern = /^\p{L}+(?:[ '\-]\p{L}+)*$/u;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const departmentPattern = /^[\p{L}][\p{L}\s&-]*$/u;
    const addressPattern = /^[\p{L}0-9][\p{L}0-9\s,.'/#-]*$/u;

    const firstName = student.firstName.trim();
    const lastName = student.lastName.trim();
    const email = student.email.trim();
    const department = student.department.trim();
    const address = student.address.trim();

    if (!firstName) {
      errors.firstName = "First name is required.";
    } else if (
      firstName.length < 2 ||
      firstName.length > 50 ||
      !namePattern.test(firstName)
    ) {
      errors.firstName = "Enter a valid first name using letters only.";
    }

    if (!lastName) {
      errors.lastName = "Last name is required.";
    } else if (lastName.length > 50 || !namePattern.test(lastName)) {
      errors.lastName = "Enter a valid last name using letters only.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (!emailPattern.test(email) || email.length > 100) {
      errors.email = "Enter a valid email address.";
    }

    if (!student.phone.trim()) {
      errors.phone = "Mobile number is required.";
    } else if (!/^[6-9][0-9]{9}$/.test(student.phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (!["Male", "Female", "Other"].includes(student.gender)) {
      errors.gender = "Please select a valid gender.";
    }

    if (!student.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else if (student.dateOfBirth >= getTodayDate()) {
      errors.dateOfBirth = "Date of birth must be before today.";
    }

    if (!department) {
      errors.department = "Department is required.";
    } else if (
      department.length < 2 ||
      department.length > 100 ||
      !departmentPattern.test(department)
    ) {
      errors.department = "Enter a valid department.";
    }

    if (!address) {
      errors.address = "Address is required.";
    } else if (
      address.length < 5 ||
      address.length > 200 ||
      !addressPattern.test(address)
    ) {
      errors.address = "Enter a valid address.";
    }

    return errors;
  };

  // Handle input changes and clear the error for the field being corrected.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const openAddForm = () => {
    setEditing(false);
    setFormData(emptyStudent);
    setFieldErrors({});
    setError("");
    setShowForm(true);
  };

  const openEditForm = (student) => {
    setEditing(true);

    setFormData({
      id: student.id,
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      phone: student.phone || "",
      gender: student.gender || "",
      dateOfBirth: student.dateOfBirth || "",
      department: student.department || "",
      address: student.address || "",
    });

    setFieldErrors({});
    setError("");
    setShowForm(true);
  };

  // Save student. ID is sent as a query parameter for updates,
  // not as a field in studentDTO.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateStudent(formData);

    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        department: formData.department.trim(),
        address: formData.address.trim(),
      };

      const response = await api.put(
        "/student/createUpdateStudent",
        payload,
        editing ? { params: { id: formData.id } } : {},
      );

      if (response.data?.status === false) {
        const message = getErrorMessage({ response });
        toast.error(message, { duration: 5000 });

        if (/email/i.test(message)) {
          setFieldErrors((previous) => ({
            ...previous,
            email: message,
          }));
        }
        return;
      }

      toast.success(
        editing
          ? "Student updated successfully!"
          : "Student added successfully!",
        { duration: 5000 },
      );

      setShowForm(false);
      setFormData(emptyStudent);
      setFieldErrors({});
      await fetchStudents();
    } catch (err) {
      console.error("Student save error:", err);

      const backendErrors = err.response?.data?.errors || [];

      const errorMessage =
        backendErrors[0]?.details ||
        backendErrors[0]?.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "";

      if (errorMessage.toLowerCase().includes("email")) {
        setFieldErrors((previous) => ({
          ...previous,
          email: errorMessage,
        }));
      } else {
        setFormError(errorMessage || "Unable to save student.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) return;

    try {
      const response = await api.delete("/student/deleteStudent", {
        params: { id },
      });

      if (response.data?.status === false) {
        toast.error(getErrorMessage({ response }));
        return;
      }

      toast.success("Student deleted successfully!");
      await fetchStudents();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(getErrorMessage(err) || "Unable to delete student.");
    }
  };

  const handleView = async (id) => {
    setError("");

    try {
      const response = await api.get("/student/getByStudentId", {
        params: { id },
      });

      const data = getResponseData(response);
      setSelectedStudent(data.studentVO);
      setShowDetails(true);
    } catch (err) {
      toast.error(
        getErrorMessage(err) || "Unable to retrieve student details.",
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchValue = search.toLowerCase();

    return (
      `${student.firstName || ""} ${student.lastName || ""}`
        .toLowerCase()
        .includes(searchValue) ||
      (student.email || "").toLowerCase().includes(searchValue) ||
      (student.department || "").toLowerCase().includes(searchValue)
    );
  });

  const inputClass = (field) =>
    `form-input${fieldErrors[field] ? " input-error" : ""}`;

  const renderFieldError = (field) =>
    fieldErrors[field] ? (
      <small className="field-error">{fieldErrors[field]}</small>
    ) : null;

  return (
    <div className="student-page">
      <div className="student-heading">
        <div>
          <h1>Student Management</h1>
          <p>Manage student records and information.</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="student-summary">
        <div className="summary-icon">
          <Users size={25} />
        </div>
        <div>
          <p>Total Students</p>
          <h2>{students.length}</h2>
        </div>
      </div>

      <div className="student-table-card">
        <div className="table-toolbar">
          <div>
            <h2>All Students</h2>
            <p>Student records available in the database</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              className="refresh-btn"
              onClick={fetchStudents}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {error && <p className="page-error">{error}</p>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>S No.</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td className="student-name">
                      {student.firstName} {student.lastName}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.phone || "-"}</td>
                    <td>
                      <span className="department-badge">
                        {student.department || "-"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          title="View"
                          onClick={() => handleView(student.id)}
                          type="button"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditForm(student)}
                          type="button"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(student.id)}
                          type="button"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="student-modal">
            <div className="modal-header">
              <div>
                <h2>{editing ? "Update Student" : "Add New Student"}</h2>
                <p>Enter the student information below.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
                type="button"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    className={inputClass("firstName")}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    maxLength={50}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                  />
                  {renderFieldError("firstName")}
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    className={inputClass("lastName")}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    maxLength={50}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                  />
                  {renderFieldError("lastName")}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    className={inputClass("email")}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  {renderFieldError("email")}
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    className={inputClass("phone")}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setFormData((previous) => ({
                          ...previous,
                          phone: value,
                        }));
                        setFieldErrors((previous) => ({
                          ...previous,
                          phone: "",
                        }));
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    aria-invalid={Boolean(fieldErrors.phone)}
                  />
                  {renderFieldError("phone")}
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    className={inputClass("gender")}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.gender)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {renderFieldError("gender")}
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    className={inputClass("dateOfBirth")}
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    max={getMaxDateOfBirth()}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.dateOfBirth)}
                  />
                  {renderFieldError("dateOfBirth")}
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    className={inputClass("department")}
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.department)}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="MECH">MECH</option>
                    <option value="Other">Other</option>
                  </select>
                  {renderFieldError("department")}
                </div>

                <div className="form-group full-width">
                  <label>Address *</label>
                  <textarea
                    className={inputClass("address")}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    maxLength={200}
                    aria-invalid={Boolean(fieldErrors.address)}
                  />
                  {renderFieldError("address")}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Student"
                      : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedStudent && (
        <div className="modal-overlay">
          <div className="student-modal details-modal">
            <div className="modal-header">
              <div>
                <h2>Student Details</h2>
                <p>Complete student information.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowDetails(false)}
                type="button"
              >
                <X />
              </button>
            </div>

            <div className="details-grid">
              {Object.entries({
                "Student ID": selectedStudent.id,
                "First Name": selectedStudent.firstName,
                "Last Name": selectedStudent.lastName,
                Email: selectedStudent.email,
                Phone: selectedStudent.phone,
                Gender: selectedStudent.gender,
                "Date of Birth": selectedStudent.dateOfBirth,
                Department: selectedStudent.department,
                Address: selectedStudent.address,
              }).map(([label, value]) => (
                <div className="detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value || "-"}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;
