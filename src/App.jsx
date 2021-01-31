import React, { useContext, useEffect, useRef, useState } from 'react'
import { TransitionGroup, Transition } from 'react-transition-group'
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
      sliderContentRef.current.style.transform = `translate(${stateRef.current.offset}px ,0)`
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
      sliderContentRef.current.style.transform = `translate(${stateRef.current.offset}px ,0)`
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
      document.querySelector('.slider-content').style.transform = `translate(${stateRef.current.offset}px ,0)`
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
  return (
    <div className="cg">
    <div className="cg-small">
      {
        Array(3).fill('').map(item => (
          <div className="cg-small-box">
            <div className="cg-small-pic">
              <img src="img/cg/test1.jpg" alt=""/>
            </div>
          </div>
        ))
      }
    </div>
    <div className="cg-big-box">
      <div className="cg-big-pic">
        <img src="img/cg/test1.jpg" alt=""/>
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
  return (
    <div style={{transform: `translate(-12rem, 0px)`}} className="info-birth">
      <img src="img/other/cake.svg" alt=""/>
      <span>12月24日</span>
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
    <div className="info-name">
      <h1>
        {
          name.map((item, index) => (
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
    </div>
  )
}
// 罗马名
function Romaji() {
  return (
    <div className="info-romaji">
      <p>Furukawa Nagisa</p>
    </div>
  )
}
// 介绍
function Intro() {
  const { id } = useContext(Context)
  return (
    <div className="info-intro">
      <p>
        古河渚性格乐观温柔，想创立演剧部但是一直缺乏自信。在樱花飞舞的日子里与男主角冈崎朋也相遇，在动漫的渚线中最终创立演剧部成为部长，并与朋也交往。在AFTER STORY中与朋也结婚，改名冈崎渚，生下冈崎汐。患有一种不知名的病，经常休学在家，所以虽然与朋也同一个年级但是却比朋也大一岁。最喜欢的歌曲是《团子大家族》，招募演剧部部员的海报画的就是团子大家族。
      </p>
      <ul className="info-list">
        <li><span>CV</span>中原麻衣</li>
        <li><span>血型</span>A</li>
        <li><span>身高</span>155cm</li>
        <li><span>体重</span>43KG</li>
        <li><span>三维</span>B80W55H81cm</li>
        <li>{id[0]}</li>
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
