import React from 'react'
import { shallow } from 'enzyme'

import UserSignIn from './UserSignIn.js'

it('renders without props', () => {
  shallow(<UserSignIn />)
})
