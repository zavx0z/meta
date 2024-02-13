import React from 'react'
import {Route} from "react-router-dom"
import World from "../components/World"
import {Routes} from "react-router-dom"

export const Worlds = ({worlds}) => {
    const generator = (world) => {
        const routes = []
        let key = 0
        const viewsGenerator = (item) => {
            key += 1
            routes.push(<Route key={key} path={item.path} element={<World atom={item}/>}/>)
            item.child.map(item => viewsGenerator(item))
        }
        viewsGenerator(world)
        return routes
    }
    return <Routes basename={process.env.REACT_APP_BASE_PATH}>{generator(worlds)}</Routes>
}