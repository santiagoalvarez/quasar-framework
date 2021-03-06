import extend from './extend'
import { position as eventPosition } from './event'

export function getAnchorPosition (el) {
  const
    rect = el.getBoundingClientRect(),
    a = {
      top: rect.top,
      left: rect.left,
      width: el.offsetWidth,
      height: el.offsetHeight
    }

  a.right = rect.right || a.left + a.width
  a.bottom = rect.bottom || a.top + a.height
  a.middle = a.left + ((a.right - a.left) / 2)
  a.center = a.top + ((a.bottom - a.top) / 2)

  return a
}

export function getTargetPosition (el) {
  return {
    top: 0,
    center: el.offsetHeight / 2,
    bottom: el.offsetHeight,
    left: 0,
    middle: el.offsetWidth / 2,
    right: el.offsetWidth
  }
}

export function getOverlapMode (anchor, target, median) {
  if ([anchor, target].indexOf(median) >= 0) return 'auto'
  if (anchor === target) return 'inclusive'
  return 'exclusive'
}

export function getPositions (anchor, target) {
  const
    a = extend({}, anchor),
    t = extend({}, target)

  const positions = {
    x: ['left', 'right'].filter(p => p !== t.horizontal),
    y: ['top', 'bottom'].filter(p => p !== t.vertical)
  }

  const overlap = {
    x: getOverlapMode(a.horizontal, t.horizontal, 'middle'),
    y: getOverlapMode(a.vertical, t.vertical, 'center')
  }

  positions.x.splice(overlap.x === 'auto' ? 0 : 1, 0, 'middle')
  positions.y.splice(overlap.y === 'auto' ? 0 : 1, 0, 'center')

  if (overlap.y !== 'auto') {
    a.vertical = a.vertical === 'top' ? 'bottom' : 'top'
    if (overlap.y === 'inclusive') {
      t.vertical = t.vertical
    }
  }

  if (overlap.x !== 'auto') {
    a.horizontal = a.horizontal === 'left' ? 'right' : 'left'
    if (overlap.y === 'inclusive') {
      t.horizontal = t.horizontal
    }
  }

  return {
    positions: positions,
    anchorPos: a
  }
}

export function applyAutoPositionIfNeeded (anchor, target, targetOrigin, anchorOrigin, targetPosition) {
  const {positions, anchorPos} = getPositions(anchorOrigin, targetOrigin)

  if (targetPosition.top < 0 || targetPosition.top + target.bottom > window.innerHeight) {
    let newTop = anchor[anchorPos.vertical] - target[positions.y[0]]
    if (newTop + target.bottom <= window.innerHeight) {
      targetPosition.top = Math.max(0, newTop)
    }
    else {
      newTop = anchor[anchorPos.vertical] - target[positions.y[1]]
      if (newTop + target.bottom <= window.innerHeight) {
        targetPosition.top = Math.max(0, newTop)
      }
    }
  }
  if (targetPosition.left < 0 || targetPosition.left + target.right > window.innerWidth) {
    let newLeft = anchor[anchorPos.horizontal] - target[positions.x[0]]
    if (newLeft + target.right <= window.innerWidth) {
      targetPosition.left = Math.max(0, newLeft)
    }
    else {
      newLeft = anchor[anchorPos.horizontal] - target[positions.x[1]]
      if (newLeft + target.right <= window.innerWidth) {
        targetPosition.left = Math.max(0, newLeft)
      }
    }
  }
  return targetPosition
}

export function parseHorizTransformOrigin (pos) {
  return pos === 'middle' ? 'center' : pos
}

export function getTransformProperties ({targetOrigin}) {
  let
    vert = targetOrigin.vertical,
    horiz = parseHorizTransformOrigin(targetOrigin.horizontal)

  return {
    'transform-origin': vert + ' ' + horiz + ' 0px'
  }
}

export function setPosition ({el, anchorEl, anchorOrigin, targetOrigin, maxHeight, event, anchorClick, touchPosition}) {
  let anchor

  if (event && (!anchorClick || touchPosition)) {
    const {top, left} = eventPosition(event)
    anchor = {top, left, width: 1, height: 1, right: left + 1, center: top, middle: left, bottom: top + 1}
  }
  else {
    anchor = getAnchorPosition(anchorEl)
  }

  let target = getTargetPosition(el)
  let targetPosition = {
    top: anchor[anchorOrigin.vertical] - target[targetOrigin.vertical],
    left: anchor[anchorOrigin.horizontal] - target[targetOrigin.horizontal]
  }

  targetPosition = applyAutoPositionIfNeeded(anchor, target, targetOrigin, anchorOrigin, targetPosition)

  el.style.top = Math.max(0, targetPosition.top) + 'px'
  el.style.left = Math.max(0, targetPosition.left) + 'px'
  el.style.maxHeight = this.maxHeight || window.innerHeight * 0.9 + 'px'
}
