import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTrash, FaEdit, FaKey } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StudentManagement.css';

function StudentManagement() {
  
  const [students, setStudents] = useState([]);
  const [studentNameEn, setStudentNameEn] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);

  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedFacultyYearId, setSelectedFacultyYearId] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [facultyYears, setFacultyYears] = useState([]);
  const [filteredFacultyYears, setFilteredFacultyYears] = useState([]);

  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const BASE_URL = 'https://192.168.1.6:7069';

  const fetchData = async () => {
    try {
      const studentsRes = await fetch(`${BASE_URL}/api/Studets/GetAllStudets`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      const facultiesRes = await fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`);
      const facultiesData = await facultiesRes.json();
      setFaculties(facultiesData);

      const yearsRes = await fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`);
      const yearsData = await yearsRes.json();
      setFacultyYears(yearsData);
    } catch {
      toast.error("❌ Failed to load initial data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  resetForm();
}, []);


  useEffect(() => {
    if (selectedFacultyId) {
      const filtered = facultyYears.filter(fy => fy.facultyId === parseInt(selectedFacultyId));
      setFilteredFacultyYears(filtered);
    } else {
      setFilteredFacultyYears([]);
    }
    setSelectedFacultyYearId("");
  }, [selectedFacultyId, facultyYears]);

  const getFacultyNameById = (id) => faculties.find(f => f.id === parseInt(id))?.fac_Name || "";
  const getFacultyYearStringById = (id) => facultyYears.find(f => f.id === parseInt(id))?.year || "";

  const generatePassword = () => {
    const facultyCode = getFacultyNameById(selectedFacultyId).split(" ")[2] || "Dept";
    return `${studentCode}${studentNameEn.split(" ")[0]}${facultyCode}@#$`;
  };

  const addOrUpdateStudent = async () => {
    if (!studentCode || !studentNameEn || !studentEmail || !selectedFacultyId || !selectedFacultyYearId) {
      toast.warning("Please fill in all required fields");
      return;
    }

    if (!studentPassword || studentPassword.length < 6) {
      toast.error("❌ Please enter a valid password with at least 6 characters");
      return;
    }

    const codeExists = students.some(s => s.st_Code === studentCode && s.id !== editStudentId);
    if (codeExists) {
      toast.error("❌ Student code already exists");
      return;
    }

    const dto = {
      ID: isEditMode ? editStudentId : 0,
      st_Code: studentCode,
      st_NameAr: studentNameEn,
      st_NameEn: studentNameEn,
      st_Email: studentEmail,
      st_Image: "",
      phone: studentPhone,
      fac_ID: parseInt(selectedFacultyId),
      Faculty: getFacultyNameById(selectedFacultyId),
      facYearSem_ID: parseInt(selectedFacultyYearId),
      FacultyYearSemister: getFacultyYearStringById(selectedFacultyYearId)
    };

    try {
      await fetch(`${BASE_URL}/api/Studets/Add_OR_UpdateStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (!isEditMode) {
        const userDto = {
          displayName: studentNameEn,
          email: studentEmail,
          password: studentPassword,
          phoneNumber: studentPhone,
          userType: "Student"
        };

        const registerRes = await fetch(`${BASE_URL}/api/account/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userDto)
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          const errorMsg = registerData?.errors?.[0] || "Unknown registration error";
          toast.error(`❌ Register failed: ${errorMsg}`);
          return;
        }
      }

      resetForm();
      await fetchData();
      toast.success(`✅ Student ${isEditMode ? "updated" : "added"} successfully`);
    } catch {
      toast.error("❌ Failed to save student");
    }
  };

const resetForm = () => {
  setStudentCode("");
  setStudentNameEn("");
  setStudentEmail("");
  setStudentPhone("");
  setStudentPassword("");
  setSelectedFacultyId("");
  setSelectedFacultyYearId("");
  setIsEditMode(false);
  setEditStudentId(null);
};


  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;
    try {
      await fetch(`${BASE_URL}/api/Studets/DeleteStudent?id=${id}`, { method: 'DELETE' });
      await fetchData();
      toast.success("🗑️ Student deleted");
    } catch {
      toast.error("❌ Failed to delete student");
    }
  };

  const startEdit = (student) => {
    setStudentCode(student.st_Code);
    setStudentNameEn(student.st_NameEn);
    setStudentEmail(student.st_Email);
    setStudentPhone(student.phone);
    setSelectedFacultyId(student.fac_ID);
    setSelectedFacultyYearId(student.facYearSem_ID);
    setIsEditMode(true);
    setEditStudentId(student.id);
    toast.info("✏️ You can now edit the student data");
  };

  const filteredStudents = students.filter(s => {
    const byFaculty = filterFaculty ? s.faculty === getFacultyNameById(filterFaculty) : true;
    const byYear = filterYear ? getFacultyYearStringById(s.facYearSem_ID) === getFacultyYearStringById(filterYear) : true;
    return byFaculty && byYear;
  });

  return (
    <div className="dashboard-card">
      <ToastContainer position="top-center" />
      <div className="card-header"><h3>Student Management</h3></div>

      <div className="form-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <input className="course-input" style={{ flex: "1 1 100px" }} placeholder="Student Code" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} />
        <input className="course-input" style={{ flex: "2 1 200px" }} placeholder="Student Name (English)" value={studentNameEn} onChange={(e) => setStudentNameEn(e.target.value)} />
        <input className="course-input" style={{ flex: "2 1 200px" }} placeholder="Student Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
        <input className="course-input" style={{ flex: "1 1 150px" }} placeholder="Phone (Optional)" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} />

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input className="course-input" type={showPassword ? "text" : "password"} placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-btn">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
          <button type="button" onClick={() => setStudentPassword(generatePassword())} className="icon-btn"><FaKey /></button>
        </div>

        <select className="course-input" value={selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value)}>
          <option value="">Select Faculty</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.fac_Name}</option>)}
        </select>

        <select className="course-input" value={selectedFacultyYearId} onChange={(e) => setSelectedFacultyYearId(e.target.value)}>
          <option value="">Select Academic Year</option>
          {filteredFacultyYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
        </select>

        <button className="action-button" onClick={addOrUpdateStudent}>{isEditMode ? "Update" : "Add"} Student</button>
      </div>

      <div className="filter-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select className="course-input" value={filterFaculty} onChange={(e) => setFilterFaculty(e.target.value)}>
          <option value="">All Faculties</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.fac_Name}</option>)}
        </select>
        <select className="course-input" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All Academic Years</option>
          {facultyYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Code</th>
              <th>Name (En)</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Faculty</th>
              <th>Academic Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center" }}>No students found.</td></tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.st_Code}</td>
                  <td>{s.st_NameEn}</td>
                  <td>{s.st_Email}</td>
                  <td>{s.phone}</td>
                  <td>{s.faculty}</td>
                  <td>{getFacultyYearStringById(s.facYearSem_ID)}</td>
                  <td>
                    <button className="edit-button" onClick={() => startEdit(s)}><FaEdit /></button>
                    <button className="delete-button" onClick={() => deleteStudent(s.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentManagement;
