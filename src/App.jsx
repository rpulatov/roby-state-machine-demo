import React from "react"

import Layout from "./components/Layout"

import { eventsData, servicesData, statesData, keyToLowerCase } from "./data"

import "./App.css"

function EventText({ event }) {
  return (
    <span className="badge badge-primary">
      {event ? `${event.id} - ${event.name}` : "undefined"}
    </span>
  )
}

function ServiceText({ service }) {
  return (
    <span className="badge badge-secondary">
      {service ? `${service.id} - ${service.name}` : "undefined"}
    </span>
  )
}

function StateText({ state }) {
  return (
    <span className="badge badge-accent">
      {state ? `${state.code} - ${state.name}` : "undefined"}
    </span>
  )
}

function ActionText({ action, fromEventId }) {
  console.info("ActionText", { action, fromEventId })
  let message = ""
  if (action["event"]) {
    const event = keyToLowerCase(action["event"])
    const services = (Array.isArray(event.to) ? event.to : [event.to]).map(id => servicesData[id])
    message = (
      <>
        Отправить распоряжение
        {services.length > 1 ? " " : " "}
        {services.map((service, index) => (
          <React.Fragment key={service.id}>
            <ServiceText service={service} />
            {index < services.length - 1 ? "," : ""}
          </React.Fragment>
        ))}
      </>
    )
  } else if (action["event_act"]) {
    const event = keyToLowerCase(action["event_act"])
    const services = (Array.isArray(event.to) ? event.to : [event.to]).map(id => servicesData[id])
    message = (
      <>
        Отправить распоряжение
        {services.length > 1 ? " " : " "}
        {services.map((service, index) => (
          <React.Fragment key={service.id}>
            <ServiceText service={service} />
            {index < services.length - 1 ? "," : ""}
          </React.Fragment>
        ))}{" "}
        с ожиданием ответа
      </>
    )
  } else if (action["route"]) {
    const route = action["route"]

    const services = (Array.isArray(route) ? route : [route]).map(id => servicesData[id])

    message = (
      <>
        Отправить распоряжение
        {services.length > 1 ? " " : " "}
        {services.map((service, index) => (
          <React.Fragment key={service.id}>
            <ServiceText service={service} />
            {index < services.length - 1 ? "," : ""}
          </React.Fragment>
        ))}
      </>
    )
  } else if (action["route_act"]) {
    const route = action["route_act"]

    const services = (Array.isArray(route) ? route : [route]).map(id => servicesData[id])

    message = (
      <>
        Отправить распоряжение
        {services.length > 1 ? " " : " "}
        {services.map((service, index) => (
          <React.Fragment key={service.id}>
            <ServiceText service={service} />
            {index < services.length - 1 ? "," : ""}
          </React.Fragment>
        ))}{" "}
        с ожиданием ответа
      </>
    )
  } else if (action["state"]) {
    const state = action["state"]
    message = (
      <>
        Перейти в состояние <StateText state={statesData[state]} />
      </>
    )
  }
  return message
}

function TimeoutButton({ children, onClick, delay }) {
  const [second, setSecond] = React.useState(delay)
  React.useEffect(() => {
    if (delay > 0) {
      const timer = setInterval(() => setSecond(prev => (prev > 0 ? prev - 1 : 0)), 1000)
      return () => clearInterval(timer)
    }
  }, [delay])

  React.useEffect(() => {
    if (second === 0) {
      // TODO: временно закоментировал, чтобы при коротких таймерах не происходил автоклик
      // onClick()
    }
  }, [second, onClick])

  return (
    <button className="btn btn-primary" onClick={onClick}>
      {children} (Запуск через {second} сек)
    </button>
  )
}

function App() {
  const [currentState, setCurrentState] = React.useState("IDLE")

  const [currentEvent, setCurrentEvent] = React.useState(null)

  const getNextStateFromActions = React.useCallback(actions => {
    if (!actions || !Array.isArray(actions)) return null
    const actionState = actions.find(action => !!action["state"])
    return actionState ? actionState["state"] : null
  }, [])

  const state = statesData[currentState]

  if (!state)
    return (
      <Layout>
        <div class="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Состояния {currentState} нет в конфигурационном файле</span>
          </div>
        </div>
      </Layout>
    )

  return (
    <Layout>
      <div className="fixed w-full left-0 top-0 bg-white pt-5 drop-shadow-xl">
        <Layout>
          <div className="flex flex-row mb-2 ">
            <div className="text-2xl font-bold text-gray-900 mr-2">Cценарий: </div>
            <div className="text-2xl">Scan&Go без кофемашины</div>
          </div>
          <div className="flex flex-row mb-6 ">
            <div className="text-2xl font-bold text-gray-900 mr-2">Cостояние:</div>
            <div className="text-2xl mr-2">{state.name}</div>
            <div className="text-base mt-1">({state.description})</div>
          </div>
          <div className="btm-nav btm-nav-lg ">
            {Object.values(statesData).map(item => (
              <button
                className={`btn mr-3 mb-3 ${currentState === item.code ? "btn-primary" : ""}`}
                onClick={() => setCurrentState(item.code)}
              >
                {item.code}
              </button>
            ))}
          </div>
        </Layout>
      </div>
      <div className="h-64"></div>
      <div className="mt-10 flex w-full">
        <div className="w-3/6">
          <div className="mb-5 p-3 flex-grow bg-base-300 rounded-box">
            <div className="text-lg font-bold">Действия, выполняемые при входе в состояние:</div>
            <ul className="list-disc list-inside">
              {state.on_enter
                ? state.on_enter.map((item, key) => {
                    const actionSource = keyToLowerCase(item)
                    return (
                      <li key={key} className="my-4">
                        <ActionText action={actionSource} />
                      </li>
                    )
                  })
                : null}
            </ul>
          </div>
          <div className="mb-5 p-3 flex-grow bg-base-300 rounded-box">
            <div className="text-lg font-bold">
              Ожидаемые в текущем состоянии входящие сообщения:
            </div>
            {state.on_events
              ? state.on_events.map((event, key) => {
                  return (
                    <button
                      key={event.id}
                      className="btn btn-primary mt-5 mr-5"
                      onClick={() => setCurrentEvent(event)}
                    >
                      <EventText event={eventsData[event.id]} />
                    </button>
                  )
                })
              : null}
          </div>

          {state.on_timer && state.on_timer.actions ? (
            <div className="mb-5 p-3 flex-grow bg-base-300 rounded-box">
              <div className="text-lg font-bold">Таймер на получение событий:</div>

              <ul className="list-disc list-inside">
                {state.on_timer.actions.map((item, key) => {
                  const actionSource = keyToLowerCase(item)
                  return (
                    <li key={key} className="my-4">
                      <ActionText action={actionSource} />
                    </li>
                  )
                })}
              </ul>

              {state.on_timer.delay ? (
                <TimeoutButton
                  delay={state.on_timer.delay}
                  onClick={() => {
                    const nextState = getNextStateFromActions(state.on_timer.actions)
                    if (nextState) {
                      setCurrentState(nextState)
                      setCurrentEvent(null)
                    } else {
                      alert("Ошибка: в данном действии нет следующего состояния")
                    }
                  }}
                >
                  Выполнить
                </TimeoutButton>
              ) : null}
            </div>
          ) : null}

          {Array.isArray(state.on_response) && state.on_response.length > 0 ? (
            <div className="mb-5 p-3 flex-grow bg-base-300 rounded-box">
              <div className="text-lg font-bold">Действия выполняемые в случае неответа:</div>

              <ul className="list-disc list-inside">
                {state.on_response.map((item, key) => {
                  const actionSource = keyToLowerCase(item)
                  return (
                    <li key={key} className="my-4">
                      <ActionText action={actionSource} />
                    </li>
                  )
                })}
              </ul>

              <button
                className="btn"
                onClick={() => {
                  const nextState = getNextStateFromActions(state.on_response)
                  if (nextState) {
                    setCurrentState(nextState)
                    setCurrentEvent(null)
                  } else {
                    alert("Ошибка: в данном действии нет следующего состояния")
                  }
                }}
              >
                Выполнить
              </button>
            </div>
          ) : null}
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="w-3/6">
          {currentEvent ? (
            <div className="mb-5 grid flex-grow card bg-base-300 rounded-box">
              <div className="text-lg font-bold bg-slate-300 p-3">
                Действия, выполняемые при получении сообщения:
                {<EventText event={eventsData[currentEvent.id]} />}
              </div>
              <div className="px-3 pb-3">
                <ul className="list-disc list-inside">
                  {currentEvent.actions.map((item, key) => {
                    const actionSource = keyToLowerCase(item)
                    return (
                      <li key={key} className="my-4">
                        <ActionText action={actionSource} fromEventId={currentEvent.id} />
                      </li>
                    )
                  })}
                </ul>

                <button
                  className="btn"
                  onClick={() => {
                    const nextState = getNextStateFromActions(currentEvent.actions)
                    if (nextState) {
                      setCurrentState(nextState)
                      setCurrentEvent(null)
                    } else {
                      alert("Ошибка: в данном действии нет следующего состояния")
                    }
                  }}
                >
                  Выполнить
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

export default App
