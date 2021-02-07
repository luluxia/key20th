import React, { useEffect, useState } from 'react'
import { TransitionGroup, Transition } from 'react-transition-group'
import './test.css'
function APP() {
  const [num , setNum] = useState(0)
  const [id, setId] = useState([0])
  useEffect(() => {
    console.log('test')
  }, [id[0]])
  function add() {
    setNum(num + 1)
    setId(item => [...item, num])
    setTimeout(() => {
      setId([num])
    })
  }
  return (
    <div>
      <button onClick={() => add()}>按钮</button>
      <TransitionGroup>
        {
          id.map(id => (
            <Transition key={id} timeout={1500}>
              <li>{id}</li>
            </Transition>
          ))
        }
      </TransitionGroup>
    </div>
  )
}
export default APP