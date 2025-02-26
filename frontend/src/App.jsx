/** @format */

import React from "react";
import { Container } from "react-bootstrap";
import StudentList from "./components/StudentList";

function App() {
	return (
		<Container className="mt-4">
			<StudentList />
		</Container>
	);
}

export default App;
