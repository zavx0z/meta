import React from 'react'
import {inject, observer} from "mobx-react"
import {Atom} from "./components/Atom"

const Group = ({universe, children}) => {
    return <>
        <group name={'universe'}>
            {universe.atoms.map(atom => <Atom key={atom} world={universe.extract(atom)}/>)}
        </group>
        {children}
    </>
}
export const Universe = inject('universe')(observer(Group))