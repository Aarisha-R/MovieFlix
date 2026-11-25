// import { useState } from "react";
// function TodoApp() {
//     const [todos, setTodos] = useState([]);
//     const [input, setInput] = useState("");
//     const addTodo = () => {
//         if (!input.trim()) return;
//         setTodos([...todos, input]); // Fixed typo here
//         setInput("");
    // };
//     const deleteTodo = (index) => {
//         setTodos(todos.filter((_, i) => i !== index));
//     };
//     return (
//         <div>
//             <h2>Todo List</h2>
//             <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter todo" />
//             <button onClick={addTodo}>Add</button>
//             <ul>
//                 {todos.map((todo, i) => (
//                     <li key={i}>
//                         {todo} <button onClick={() => deleteTodo(i)}>Delete</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
// export default TodoApp;/
//...................................................................................................
// userform validation using regex

// import { useState } from "react";
// function UserForm() {
//     const [form, setForm] = useState({ name: "", email: "", age: "" });
//     const [errors, setErrors] = useState({});

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm({ ...form, [name]: value });
//         let error = "";
//         if(name === "name" && value.trim()==="") {
//             error = "Name is required";
//         } 
//         if(name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//             error = "Invalid email format";
//         }
//         if(name==="age" && (isNaN(value) || value < 0)) {
//             error = "Age must be a positive number";
//         }
//         setErrors({ ...errors, [name]: error });    
//     }
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         const newErrors = {};

//         if(!form.name.trim()) {
//             newErrors.name = "Name is required";
//         }
//         if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//             newErrors.email = "valid email format";
//         }   
//         if( !form.age || isNaN(form.age) || form.age < 0) {
//             newErrors.age = "Enter a valid positive number";
//         }
    
//         if(Object.keys(newErrors).length >0) {
//             setErrors(newErrors);
//             return;
//             }
//             console.log("Submitted Date:", form);
//     };
//     return (
//         <form onSubmit={handleSubmit}>
//             <h2>User Form with Validation</h2>
//             <input name ="name" value= {form.name} onChange={handleChange} placeholder="Name" />
//             {errors.name && <p style={{color:"red"}}>{errors.name}</p>}
//             <input 
//             name = "email"
//             value = {form.email}
//             onChange={handleChange}
//             placeholder="Email"
//             />
//             {errors.email && <p style={{color:"red"}}>{errors.email}</p>}
//             <button type="submit">Submit</button>
//             </form>
//     )
//         }
// export default UserForm;