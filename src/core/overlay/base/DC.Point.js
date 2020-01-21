/*
 * @Author: Caven
 * @Date: 2020-01-06 15:03:25
 * @Last Modified by: Caven
 * @Last Modified time: 2020-01-21 10:17:55
 */

import Cesium from '@/namespace'
import Overlay from '../Overlay'

const DEF_STYLE = {
  pixelSize: 8,
  outlineColor: DC.Color.BLUE,
  outlineWidth: 2
}

DC.Point = class extends Overlay {
  constructor(position) {
    if (!position || !(position instanceof DC.Position)) {
      throw new Error('the position invalid')
    }
    super()
    this._position = position
    this._delegate = new Cesium.Entity()
    this._state = DC.OverlayState.INITIALIZED
    this.type = DC.OverlayType.POINT
  }

  set position(position) {
    this._position = position
  }

  get position() {
    return this._position
  }

  _prepareDelegate() {
    // 设置位置
    this._delegate.position = new Cesium.CallbackProperty(time => {
      return DC.T.transformWSG84ToCartesian(this._position)
    })
    // 设置朝向
    this._delegate.orientation = new Cesium.CallbackProperty(time => {
      return Cesium.Transforms.headingPitchRollQuaternion(
        DC.T.transformWSG84ToCartesian(this._position),
        new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(this._position.heading),
          Cesium.Math.toRadians(this._position.pitch),
          Cesium.Math.toRadians(this._position.roll)
        )
      )
    })
    // 初始化Overlay参数
    this._delegate.point = {
      ...DEF_STYLE,
      ...this._style
    }
    this._delegate.layer = this._layer
    this._delegate.overlayId = this._id
  }

  _addCallback(layer) {
    this._layer = layer
    this._prepareDelegate()
    this._layer.delegate.entities.add(this._delegate)
    this._state = DC.OverlayState.ADDED
  }

  _removeCallback() {
    if (this._layer) {
      this._layer.delegate.entities.remove(this._delegate)
      this._state = DC.OverlayState.REMOVED
    }
  }

  setStyle(style) {
    if (Object.keys(style).length === 0) {
      return
    }
    this._style = style
    this._delegate.point && DC.Util.merge(this._delegate.point, DEF_STYLE, this._style)
    return this
  }
}