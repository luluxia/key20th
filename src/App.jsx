import React, { useContext, useEffect, useRef, useState } from 'react'
import { TransitionGroup, CSSTransition, Transition } from 'react-transition-group'
import anime from 'animejs'
import _ from 'lodash'
import key from './data.js'
import './App.sass'
// 初始化
let data = _.sortBy(key.data, ['month', 'day', 'name[3]'])
let dataByProduct = {}
let dataByMonth = Array.from({length:13}, ()=>[])
key.products.forEach(product => {
  dataByProduct[product] = []
})
data.forEach((item, index) => {
  item.id = index
  dataByMonth[item.month - 1].push(item)
  item.from.forEach(product => {
    dataByProduct[product].push(item)
  })
})
// 边框
function Border() {
  return (
    <div className="border">
      <div className="border-light"></div>
      <div className="border-group">
        <div className="round-left-top"></div>
        <div className="round-left-bottom"></div>
        <div className="round-right-top"></div>
        <div className="round-right-bottom"></div>
        <div className="border-bold"></div>
      </div>
    </div>
  )
}
// 时间轴
function Slider() {
  const sliderRef = useRef(null)
  const sliderContentRef = useRef(null)
  const requestRef = useRef()
  const stateRef = useRef()
  const { setId } = useContext(Context)
  // 选择
  function choose(id, target) {
    // 不处于拖拽
    if(stateRef.current.drag == 0) {
      stateRef.current.trans = 1
      stateRef.current.offset = document.body.clientWidth / 2 - target.offsetLeft - target.clientWidth / 2
      sliderContentRef.current.style.transform = `translate3d(${stateRef.current.offset}px ,0px, 0px)`
      sliderContentRef.current.classList.add('slider-move')
      setTimeout(() => {
        stateRef.current.trans = 0
        sliderContentRef.current.classList.remove('slider-move')
      }, 300)
      setId([id])
    }
  }
  // 按下鼠标
  function sliderDown(e) {
    stateRef.current.mouseDown = 1
    stateRef.current.drag = 0
    stateRef.current.mouse = e.clientX
    stateRef.current.past = stateRef.current.offset
    sliderRef.current.style.cursor = 'grabbing'
  }
  // 移动鼠标
  function sliderMove(e) {
    // 按下鼠标且不处于过渡
    if(stateRef.current.mouseDown && !stateRef.current.trans){
      stateRef.current.change = stateRef.current.mouse - e.clientX
      if(stateRef.current.offset != stateRef.current.past - stateRef.current.change){
        stateRef.current.drag = 1
        setTimeout(() => {
          sliderContentRef.current.classList.remove('slider-move')
        }, 300)
      }
    }
  }
  // 鼠标抬起
  function sliderUp() {
    stateRef.current.mouseDown = 0
    sliderRef.current.style.cursor = 'grab'
    if(!stateRef.current.trans) {
      const items = document.querySelectorAll('.slider-item')
      const itemWidth = items[0].clientWidth / 2
      const center = document.body.clientWidth / 2
      let targetWidth = Math.abs(items[0].getBoundingClientRect().left + itemWidth - center)
      let target = 0
      items.forEach((item, index) => {
        const width = Math.abs(item.getBoundingClientRect().left + itemWidth - center)
        if(width < targetWidth){
          target = index
          targetWidth = width
        }
      })
      setId([target])
      stateRef.current.offset = center - items[target].offsetLeft - itemWidth
      sliderContentRef.current.style.transform = `translate3d(${stateRef.current.offset}px ,0px, 0px)`
      sliderContentRef.current.classList.add('slider-move')
      setTimeout(() => {
        sliderContentRef.current.classList.remove('slider-move')
      }, 300)
    }
  }
  // 动画
  function render() {
    if(stateRef.current.mouseDown && stateRef.current.drag){
      stateRef.current.offset = stateRef.current.offset + ((stateRef.current.past - stateRef.current.change) - stateRef.current.offset) * 0.2
      document.querySelector('.slider-content').style.transform = `translate3d(${stateRef.current.offset}px ,0px, 0px)`
    }
    requestRef.current = requestAnimationFrame(render)
  }
  useEffect(() => {
    stateRef.current = {
      mouseDown: 0,
      drag: 0,
      offset: 0,
      past: 0,
      mouse: 0,
      change: 0,
      trans: 0
    }
    requestRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(requestRef.current)
  }, [])
  return (
    <div 
      onMouseDown={e => {sliderDown(e)}}
      onMouseMove={e => {sliderMove(e)}}
      onMouseUp={e => {sliderUp(e)}}
      onMouseLeave={e => {sliderUp(e)}}
      className="slider"
      ref={sliderRef}
    >
      <div ref={sliderContentRef} className="slider-content">
        <ul className="slider-list">
          {
            data.map((item, index) => (
              <>
              {
                data[index-1]?.month != item.month &&
                <li className="slider-month">{item.month == 13 ? '无' : `${item.month}月`}</li>
              }
              <SliderItem key={index} item={item} choose={choose} index={index}/>
              </>
            ))
          }
        </ul>
      </div>
    </div>
  )
}
// 时间轴人物
function SliderItem(props) {
  return (
    <li
      onMouseUp={e => {props.choose(props.index, e.currentTarget)}}
      className="slider-item"
    >
      <div className="slider-icon">
        <img src={`img/planting/${props.item.cg[0]}`} alt=""/>
      </div>
      <p>{props.item.day == 32 ? '无' : `${props.item.day}日`}</p>
    </li>
  )
}
// 作品
function Products() {
  return (
    <div className="products">
      <li>CLANNAD</li>
    </div>
  )
}
// CG
function CG() {
  const { id } = useContext(Context)
  return (
    <TransitionGroup className="cg">
      {
        id.map(id => (
          <Transition key={id} timeout={4000}>
            { status => <CGTrans id={id} status={status}/> }
          </Transition>
        ))
      }
    </TransitionGroup>
  )
}
function CGTrans(props) {
  const ref = useRef([])
  useEffect(() => {
    if (props.status == 'entering') {
      anime({
        targets: ref.current,
        translateX: [100, 0],
        opacity: [0, 1],
        easing: "easeOutElastic(1, .9)",
        duration: 1500,
        delay: (el, i) => 100 * i
      })
    } else if (props.status == 'exiting') {
      anime.remove(ref.current)
      anime({
        targets: ref.current,
        translateX: [0, -100],
        opacity: [1, 0],
        easing: "easeOutExpo",
        duration: 1000,
        delay: (el, i) => 100 * i
      })
    }
  }, [props.status])
  return (
    <div className="cg-content">
      <div className="cg-small">
        {
          Array(3).fill('').map((item, index) => (
            <div className="cg-small-box">
              <div ref={e => {ref.current[index + 1] = e}} className="cg-small-pic">
                {
                  data[props.id]?.cg[index + 1] != ' ' ?
                  <img src={`img/cg/${data[props.id].cg[index + 1]}`} alt=""/> :
                  <img src="img/other/default.svg" alt=""/>
                }
              </div>
            </div>
          ))
        }
      </div>
      <div className="cg-big-box">
        <div ref={e => {ref.current[4] = e}} className="cg-big-pic">
          {
            data[props.id].cg[4] ?
            <img src={`img/cg/${data[props.id].cg[index + 1]}`} alt=""/> :
            <img src="img/other/default.svg" alt=""/>
          }
        </div>
      </div>
    </div>
  )
}
// 立绘
function Planting() {
  const { id } = useContext(Context)
  const oldId = useRef(0)
  const direction = useRef()
  useEffect(() => {
    if (id[0] != oldId.current) {
      if (id[0] > oldId.current) {
        direction.current = 'right'
      } else {
        direction.current = 'left'
      }
      oldId.current = id[0]
      console.log(direction.current)
    }
  }, id)
  return (
    <div className="planting">
      <TransitionGroup className="planting-pic">
        {
          id.map(id => (
            <Transition key={id} timeout={1500}>
              { status => <SwitchPlanting id={id} key={id} direction={direction.current} src={`img/planting/${data[id].cg[0]}`} status={status}/> }
            </Transition>
          ))
        }
      </TransitionGroup>
      <div className="planting-change">
        <img className="change-icon" src="img/other/change.svg" alt=""/>
        <p>Nintendo Switch</p>
      </div>
    </div>
  )
}
// 立绘切换
function SwitchPlanting(props) {
  const ref = useRef(null)
  useEffect(() => {
    if (props.status == 'entering') {
      anime({
        targets: ref.current,
        translateX: [`${props.direction == 'left' && '-'}30`, 0],
        filter: ['brightness(0)', 'brightness(1)'],
        opacity: [0, 1],
        easing: "easeOutElastic(1, .9)",
        duration: 1500
      })
    } else if (props.status == 'exiting') {
      anime.remove(ref.current)
      anime({
        targets: ref.current,
        translateX: [0, `${props.direction == 'left' ?? '-'}30`],
        opacity: [1, 0],
        easing: "easeOutExpo",
        duration: 1000,
      })
    }
  }, [props.status])
  return (
    <img ref={ref} src={props.src} alt=""/>
  )
}
// 生日
function Birth() {
  const { id } = useContext(Context)
  const birthRef = useRef({
    m: 1,
    d: 1
  })
  const domRef = useRef([])
  useEffect(() => {
    anime({
      targets: birthRef.current,
      m: data[id].month != 13 ? data[id].month : 0,
      d: data[id].day != 32 ? data[id].day : 0,
      round: 1,
      duration: 600,
      easing: "linear",
      update: () => {
        domRef.current[0].innerHTML = birthRef.current.m
        domRef.current[1].innerHTML = birthRef.current.d
      }
    })
  }, id)
  return (
    <div style={{
        transform: `translate3d(-${data[id].name[0].length * 3.375 + 1}rem, 0px, 0px)`,
        opacity: data[id].month == 13 ? 0 : 1
      }} className="info-birth">
      <img src="img/other/cake.svg" alt=""/>
      <span>
        <span ref={e => {domRef.current[0] = e}}></span>月
        <span ref={e => {domRef.current[1] = e}}></span>日
      </span>
    </div>
  )
}
// 姓名
function Name() {
  const { id } = useContext(Context)
  const [ name, setName ] = useState([])
  useEffect(() => {
    setName(data[id].name[0].split('').map(e => [e]))
  }, id)
  return (
    <TransitionGroup className="info-name">
      {
        id.map(id => (
          <Transition key={id} timeout={1500}>
            { status => <NameTrans key={id} name={name} status={status}/> }
          </Transition>
        ))
      }
    </TransitionGroup>
  )
}
// 姓名切换
function NameTrans(props) {
  const ref = useRef(null)
  useEffect(() => {
    if (props.status == 'entering') {
      anime({
        targets: ref.current.children,
        translateX: [40,0],
        translateZ: 0,
        opacity: [0,1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: (el, i) => 30 * i
      })
    } else if (props.status == 'exiting') {
      anime({
        targets: ref.current.children,
        translateX: [0,-30],
        opacity: [1,0],
        easing: "easeOutExpo",
        duration: 1200,
        delay: (el, i) => 30 * i
      })
    }
  }, [props.status])
  return (
    <h1 ref={ref}>
      {
        props.name.map((item, index) => (
          <span key={index} className="name-zh">
            {item[0]}
            {
              item[1] &&
              <span
                style={{textAlignLast: item[1].length == 1 ? 'center' : 'justify'}}
                className="name-kana">{item[1]}
              </span>
            }
          </span>
        ))
      }
    </h1>
  )
}
// 罗马名
function Romaji() {
  const { id } = useContext(Context)
  return (
    <TransitionGroup className="info-romaji">
      {
        id.map(id => (
          <Transition key={id} timeout={1500}>
            { status => <RomajiTrans id={id} status={status}/> }
          </Transition>
        ))
      }
    </TransitionGroup>
  )
}
function RomajiTrans(props) {
  const ref = useRef(null)
  useEffect(() => {
    if (props.status == 'entering') {
      anime({
        targets: ref.current.children,
        translateY: ["1.1em", 0],
        translateX: ["0.55em", 0],
        translateZ: 0,
        rotateZ: [180, 0],
        opacity: [0, 1],
        duration: 750,
        easing: "easeOutExpo",
        delay: (el, i) => 50 * i
      })
      anime({
        targets: ref.current,
        opacity: [0, 0.1],
        duration: 1000,
        easing: "easeOutExpo"
      })
    } else if (props.status == 'exiting') {
      anime({
        targets: ref.current,
        opacity: [0.1, 0],
        duration: 1000,
        easing: "easeOutExpo"
      })
    }
  }, [props.status])
  return (
    <p ref={ref}>
      {
        data[props.id].name[3]?.split('').map(item => (<span>{item}</span>))
      }
    </p>
  )
}
// 介绍
function Intro() {
  const { id } = useContext(Context)
  return (
    <TransitionGroup className="info-intro">
      {
        id.map(id => (
          <CSSTransition key={id} timeout={1500} classNames="intro">
            <IntroTrans/>
          </CSSTransition>
        ))
      }
    </TransitionGroup>
  )
}
function IntroTrans() {
  const { id } = useContext(Context)
  return (
    <div>
      <p>
        { data[id]?.intro ?? "(｡･∀･)ﾉﾞ嗨，欢迎来到Key Character Birthday Timeline（Key20th Version），本站正并且将长期处于建设中（咕咕咕~），如果你看到了这段话，那说明这位角色的介绍还没有添加，如果你想要为角色补充更多信息、或者发现了信息错误，或者是想要添加一些新角色的话，欢迎前往GIthub一起参与这个项目的开发！" }
      </p>
      <ul className="info-list">
        {
          data[id].other.map(item => (
            <li><span>{item[0]}</span>{item[1]}</li>
          ))
        }
      </ul>
    </div>
  )
}
const Context = React.createContext({})
function App() {
  const [id, setId] = useState([0])
  return (
    <Context.Provider value={{id, setId}} className="App">
      <div className="content">
        <div className="box">
          <Border/>
          <Products/>
          <CG/>
          <Planting/>
          <div className="info">
            <div className="info-title">
              <Birth/>
              <Name/>
              <Romaji/>
            </div>
            <Intro/>
          </div>
        </div>
      </div>
      <Slider/>
    </Context.Provider>
  )
}

export default App
