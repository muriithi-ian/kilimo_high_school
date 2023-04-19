import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

interface IClassInput {
	name: string;
	stream: any;
}

// create class
app.post("/createClass", async (req, res) => {
	try {
		const newClass = req.body as IClassInput;
		const createdClass = await prisma.class.create({
			data: {
				name: newClass.name,
				stream: newClass.stream,
			},
		});
		res.json(createdClass);
	} catch (err: any) {
		res.status(400).send(err.message);
	}
});

// get all classes
app.get("/getAllClasses", async (req, res) => {
	const allClasses = await prisma.class.findMany({
		orderBy: [
			{
				name: "asc",
			},
			{
				stream: "asc",
			}
		]
	});
	res.json(allClasses);
});

// get class by id
app.get("/getClassById/:id", async (req, res) => {
	const { id } = req.params;

	const classByFormAndStream = await prisma.class.findFirst({
		where: {
			id: id,
		},
		include: {
			_count: {
				select: { students: true },
			},
			students: true,
		},
	});
	res.json(classByFormAndStream);
});

interface IStudentInput {
	name: string;
	dateOfBirth: Date;
	classId: string;
}

// create student
app.post("/createStudent", async (req, res) => {
	const newStudent = req.body as IStudentInput;
	const createdStudent = await prisma.student.create({
		data: {
			name: newStudent.name,
			dateOfBirth: new Date(newStudent.dateOfBirth),
			classId: newStudent.classId,
		},
	});
	res.json(createdStudent);
});

//update student
app.post("/updateStudent/:id", async (req, res) => {
	const { id } = req.params;
	const updateStudent = req.body as IStudentInput;
	const updatedStudent = await prisma.student.update({
		where: {
			id: id,
		},
		data: {
			name: updateStudent.name,
			dateOfBirth: new Date(updateStudent.dateOfBirth),
			classId: updateStudent.classId,
			updatedAt: new Date(),
		},
	});
	res.json(updatedStudent);
});

// delete student
app.get("/deleteStudent/:id", async (req, res) => {
	const { id } = req.params;
	const deletedStudent = await prisma.student.delete({
		where: {
			id: id,
		},
	});
	res.json(deletedStudent);
});

// get all students
app.get("/getAllStudents", async (req, res) => {
	const allStudents = await prisma.student.findMany();
	res.json(allStudents);
});

// get student by id
app.get("/getStudentById/:id", async (req, res) => {
	const { id } = req.params;
	const studentById = await prisma.student.findFirst({
		where: {
			id: id,
		},
		include: {
			class: true,
		},
	});
	res.json(studentById);
});

// get students by class
app.get("/getStudentsByClass/:id", async (req, res) => {
	const { id } = req.params;
	const studentsByClass = await prisma.class.findFirst({
		where: {
			id: id,
		},
		include: {
			students: true,
		},
	});
	res.json(studentsByClass);
});

app.listen(4000, () => {
	console.log("Server started on port 4000");
});
