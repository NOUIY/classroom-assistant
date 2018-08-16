import { expect } from "chai"
import * as sinon from "sinon"

import { assignmentFetchInfo } from "../assignment-fetch-info"
import {ASSIGNMENT_ERROR_INFO, ASSIGNMENT_REQUEST_INFO, ASSIGNMENT_RECEIVE_INFO} from "../../constants"

const keytar = require("keytar")

const jsonOK = (body) => {
  const mockResponse = new window.Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  })
  return Promise.resolve(mockResponse)
}

describe("assignmentFetchInfo", () => {
  let invalidURLAssignment = {
    title: "Test Assignment",
    type: "individual",
    url: "invalidURL",
    isFetching: false,
    error: null,
  }

  let validAssignment = {
    title: "Test Assignment",
    type: "individual",
    url: "http://this-is-a-valid-url.com/assignments/a1",
    isFetching: false,
    error: null,
  }

  let validSettings = {
    username: "testUser",
  }

  before(() => {
    const passwordStub = sinon.stub(keytar, "findPassword")
    passwordStub.returns("token")
  })

  after(() => {
    keytar.findPassword.restore()
  })

  it("dispatches error action on invalid URL", async () => {
    const getState = () => ({ assignment: invalidURLAssignment, settings: validSettings })
    const dispatch = sinon.spy()
    await assignmentFetchInfo()(dispatch, getState)

    expect(dispatch.calledWithMatch({ type: ASSIGNMENT_ERROR_INFO, error: "URL is invalid!" })).is.true
  })

  it("dispatches request info action", async () => {
    const getState = () => ({ assignment: validAssignment, settings: validSettings })
    const dispatch = sinon.spy()
    await assignmentFetchInfo()(dispatch, getState)

    expect(dispatch.calledWithMatch({ type: ASSIGNMENT_REQUEST_INFO })).is.true
  })

  it("dispatches error action on cannot find assignment", async () => {
    const getState = () => ({ assignment: validAssignment, settings: validSettings })
    const dispatch = sinon.spy()
    await assignmentFetchInfo()(dispatch, getState)

    expect(dispatch.calledWithMatch({ type: ASSIGNMENT_ERROR_INFO, error: "Could not find assignment." })).is.true
  })

  it("dispatches receive info action after fetch", async () => {
    const response = {title: "Test Assignment", type: "individual"}
    const getState = () => ({ assignment: validAssignment, settings: validSettings })
    const dispatch = sinon.spy()
    sinon.stub(window, "fetch")
    window.fetch.returns(jsonOK(response))
    await assignmentFetchInfo()(dispatch, getState)

    expect(dispatch.calledWithMatch({ type: ASSIGNMENT_RECEIVE_INFO, payload: response })).is.true
    window.fetch.restore()
  })
})
