import React from 'react'
import { shallow } from 'enzyme'

import UserPage from './UserPage.js'

it('renders without props', () => {
  shallow(<UserPage />)
})
