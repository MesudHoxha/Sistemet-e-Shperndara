import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function GradeSection() {
  const { authTokens, user } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [professorId, setProfessorId] = useState(null);
  const [newGrade, setNewGrade] = useState({
    student: '',
    subject: '',
    exam: '',
    score: '',
  });

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchInitialData();
    fetchProfessorId();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [gradeRes, subjectRes, examRes, submissionRes, departmentRes, studentRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/grades/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/exams/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/exam-submissions/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/departments/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/students/', { headers }),
      ]);
      setGrades(gradeRes.data);
      setSubjects(subjectRes.data);
      setAllExams(examRes.data);
      setSubmissions(submissionRes.data);
      setDepartments(departmentRes.data);

      const map = {};
      studentRes.data.forEach(s => {
        map[s.id] = `${s.id} — ${s.first_name} ${s.last_name}`;
      });
      setStudentsMap(map);
    } catch (err) {
      console.error("Gabim gjatë ngarkimit të të dhënave:", err);
    }
  };

  const fetchProfessorId = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/professors/', { headers });
      const prof = res.data.find(p => p.email === user.email);
      if (prof) setProfessorId(prof.id);
    } catch (err) {
      console.error("Gabim në gjetjen e profesorit:", err);
    }
  };

  useEffect(() => {
    const filtered = allExams.filter(e => e.subject === parseInt(newGrade.subject));
    setFilteredExams(filtered);
    setNewGrade(prev => ({ ...prev, exam: '', student: '' }));
    setFilteredStudents([]);
  }, [newGrade.subject]);

  useEffect(() => {
    const selectedExam = allExams.find(e => e.id === parseInt(newGrade.exam));
    if (!selectedExam) return;

    const filtered = submissions.filter(s => s.subject === selectedExam.subject);
    setFilteredStudents(filtered.map(s => ({
      id: s.id,
      student: s.student,
      label: studentsMap[s.student] || `ID ${s.student}`
    })));

    setNewGrade(prev => ({ ...prev, student: '' }));
  }, [newGrade.exam, submissions, studentsMap, allExams]);

  const handleScoreChange = (id, newScore) => {
    setGrades(prev =>
      prev.map(grade =>
        grade.id === id ? { ...grade, score: newScore } : grade
      )
    );
  };

  const handleSave = (grade) => {
    axios
      .put(`http://127.0.0.1:8000/api/v1/grades/${grade.id}/`, grade, { headers })
      .then(() => alert('Nota u ruajt me sukses!'))
      .catch(() => alert('Gabim gjatë ruajtjes!'));
  };

  const handleAddGrade = () => {
    const { student, subject, exam, score } = newGrade;
    if (!student || !subject || !exam || !score) {
      alert('Ju lutem plotësoni të gjitha fushat.');
      return;
    }

    const alreadyGraded = grades.some(g =>
      g.student === parseInt(student) &&
      g.exam === parseInt(exam)
    );

    if (alreadyGraded) {
      alert('⚠️ Ky student është vlerësuar tashmë për këtë provim.');
      return;
    }

    axios
      .post('http://127.0.0.1:8000/api/v1/grades/', newGrade, { headers })
      .then((res) => {
        alert('Nota u shtua me sukses!');
        setGrades(prev => [...prev, res.data]);
        setNewGrade({ student: '', subject: '', exam: '', score: '' });
      })
      .catch(err => {
        console.error(err.response?.data || err.message);
        alert('Gabim gjatë shtimit të notës!');
      });
  };

  const professorSubjects = subjects.filter(s => s.professor === professorId);
  const professorDepartments = Array.from(new Set(professorSubjects.map(s => s.department)));
  const subjectsInSelectedDepartment = professorSubjects.filter(s => s.department === parseInt(selectedDepartment));

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '22px', marginBottom: '20px' },
    label: { fontWeight: 'bold', display: 'block', marginTop: '10px' },
    select: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px', minWidth: '220px' },
    input: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px', width: '100px' },
    button: { padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', marginTop: '10px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '30px' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #ccc' },
    listItem: { backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📝 Vendos Nota për Lëndët</h3>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {grades.map((grade) => (
          <li key={grade.id} style={styles.listItem}>
            <strong>Student:</strong> {grade.student_name} —
            <strong> Lënda:</strong> {grade.subject_name} —
            <strong> Nota:</strong>
            <input
              type="number"
              min="0"
              max="100"
              value={grade.score}
              onChange={(e) => handleScoreChange(grade.id, e.target.value)}
              style={styles.input}
            />
            <button onClick={() => handleSave(grade)} style={styles.button}>💾 Ruaj</button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: '30px 0' }} />
      <h4>➕ Shto një Notë të Re</h4>

      <label style={styles.label}>Departamenti:</label>
      <select
        value={selectedDepartment}
        onChange={(e) => {
          setSelectedDepartment(e.target.value);
          setNewGrade(prev => ({ ...prev, subject: '', exam: '', student: '' }));
        }}
        style={styles.select}
      >
        <option value="">Zgjedh</option>
        {departments
          .filter(d => professorDepartments.includes(d.id))
          .map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
      </select>

      <label style={styles.label}>Lënda:</label>
      <select
        value={newGrade.subject}
        onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
        style={styles.select}
        disabled={!selectedDepartment}
      >
        <option value="">Zgjedh</option>
        {subjectsInSelectedDepartment.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <label style={styles.label}>Provimi:</label>
      <select
        value={newGrade.exam}
        onChange={(e) => setNewGrade({ ...newGrade, exam: e.target.value })}
        style={styles.select}
        disabled={!newGrade.subject}
      >
        <option value="">Zgjedh</option>
        {filteredExams.map(e => (
          <option key={e.id} value={e.id}>
            {e.subject_name} — {e.exam_date}
          </option>
        ))}
      </select>

      <label style={styles.label}>Studenti:</label>
      <select
        value={newGrade.student}
        onChange={(e) => setNewGrade({ ...newGrade, student: e.target.value })}
        style={styles.select}
        disabled={!newGrade.exam}
      >
        <option value="">Zgjedh</option>
        {filteredStudents.map(s => (
          <option key={s.id} value={s.student}>{s.label}</option>
        ))}
      </select>

      <label style={styles.label}>Nota:</label>
      <input
        type="number"
        min="0"
        max="100"
        value={newGrade.score}
        onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
        style={styles.input}
      />
      <br />
      <button onClick={handleAddGrade} style={styles.button}>➕ Shto Notë</button>
    </div>
  );
}

export default GradeSection;
