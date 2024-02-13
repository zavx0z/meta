import React from 'react'
import {Space} from "./Space"
import {Universe} from "./Universe"
import {Worlds} from "./containers/Worlds"
import store from "./stores/universeStore"
import Supervisor from "./Supervisor"

export default () =>
    <Space>
        <Supervisor>
            <Universe>
                <Worlds worlds={store.worlds}/>
            </Universe>
        </Supervisor>
    </Space>