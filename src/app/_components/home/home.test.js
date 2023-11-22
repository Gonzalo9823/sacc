import React from 'react'
import { shallow } from 'enzyme'

import Home from './home.js'

it('renders without props', () => {
  shallow(<Home />)
})
