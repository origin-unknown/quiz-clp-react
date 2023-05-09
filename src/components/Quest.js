import React, { useState, useEffect, useRef } from 'react';
import { animated, useSpring } from "react-spring";
import { useTransition } from '@react-spring/web'
import './Quest.css';

function Quest() {

	const btnsRef = useRef([]);

	const [score, setScore] = useState(0);
	const [level, setLevel] = useState(1);
	const [question, setQuestion] = useState('');
	const [answers, setAnswers] = useState([]);

	const [done, setDone] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const finishedAnim = useSpring({
		from: { opacity: 0 },
		to: { opacity: 1 }, 
		config: { duration: 500 }, 
		reset: true
	});

	const transitions = useTransition(answers, {
		from: { display: 'none', opacity: 0, scale: 0.4, asdf: 0 }, 
		enter: [{ asdf: 1 }, { display: 'block', opacity: 1, scale: 1 }], 
		leave: [{ opacity: 0, scale: 0.4 }, { display: 'none' }],
		trail: 100, 
	});

	const questionTransition = useTransition(question, {
		from: { display: 'none', opacity: 0, asdf: 0 }, 
		enter: [{ asdf: 1 }, { display: 'flex', opacity: 1 }], 
		leave: [{ opacity: 0 }, { display: 'none' }],
		config: { duration: 800 }, 
	});

	useEffect(() => {
		setLoading(true);
		fetch('/quest')
			.then(resp => resp.ok && resp.json())
			.then(data => {
				if (data) {
					setLevel(data.level);
					setScore(data.score);
					setQuestion(data.question);
					setAnswers(data.answers);
				} else {
					throw new Error('Sorry! Can not reach server.')
				}
				setLoading(false);
			})
			.catch(err => {
				setLoading(false);
				setError(err)
			});
	}, []);

	const handleSubmit = (event) => {
		event.preventDefault();
		btnsRef.current.forEach(e => e && (e.disabled = true));
		setLoading(true);
		fetch('/quest', {
			method: 'POST', 
			headers: { 'Content-Type': 'application/json' }, 
			body: JSON.stringify({ value: event.nativeEvent.submitter.value })
		})
			.then(resp => resp.ok && resp.json())
			.then(data => {
				if (data) {
					setScore(data.score);
					setLevel(data.level);
					setQuestion(data.question);
					setAnswers(data.answers);
					setDone(data.finished);
				} else {
					throw new Error('Sorry! Can not reach server.')
				}
				setLoading(false);
			})
			.catch(err => {
				setLoading(false);
				setError(err)
			});
	};

	return (
		<div className="Quest">
			{ loading && (
				<div className="Overlay">
					<div className="lds-dual-ring"></div>
				</div>
			)}
			<div className="Hud">
				<div><span>Lvl:</span><output>{ level }</output></div>
				<div><span>Pts:</span><output>{ score }</output></div>
			</div>
			{ error 
				? (
				<p style={{ color: 'red' }}>{ error.message }</p>
				)
				: (
					done 
						? (
							score > 0 
								? (
									<animated.div style={ finishedAnim }>
										<h1>Congratulations!</h1>
										<h1>You finished the exercise with {score} points.</h1>
										<button className="BtnRefresh" onClick={() => window.location.reload() }>Try again.</button>
									</animated.div>
								)
								: (
									<animated.div style={ finishedAnim }>
										<h1>Sorry!</h1>
										<h1>You finished the exercise with {score} points.</h1>
										<button className="BtnRefresh" onClick={() => window.location.reload() }>Try again.</button>
									</animated.div>
								)
						)
						: (
							<div>
								{questionTransition((props, item, state, index) => {
									return (
										<animated.h1 
											key={ index } 
											style={{ ...props }} 
											className="Question"
										>{ item }</animated.h1>
									)
								})}
								<form className="Quest-form" onSubmit={ handleSubmit }>
									{transitions((props, item, state, index) => {
										return (
											<animated.button 
												ref={ ref => { btnsRef.current[index] = ref } }
												key={ index }
												style={{ ...props }}
												type="submit"
												value={ index + 1 }
											>{ item }</animated.button>
										) 
									})}
								</form>
							</div>
						)
					
				)
			}
		</div>
	);
}

export default Quest;