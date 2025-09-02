import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function Routine() {
	const { id } = useParams();
	const [routine, setRoutine] = useState(null);

	useEffect(() => {
		API.get(`/routines/${id}`).then((res) => setRoutine(res.data));
	}, [id]);

	if (!routine) return <p>Loading...</p>;

	return (
		<div className='page'>
			<h1>{routine.title}</h1>
			<p>{routine.description}</p>
			<h2>Tasks</h2>
			<ul>
				{routine.tasks.map((t) => (
					<li key={t.id}>
						{t.start_time} - {t.title} ({t.type}, {t.duration} min)
					</li>
				))}
			</ul>
		</div>
	);
}
