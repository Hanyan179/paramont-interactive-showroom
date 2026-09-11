# 来源与许可

## 公司内容

公司标志、五个已整理品牌标志与官网事实来源于 https://www.paramontgroup.com/ ，用于用户授权的公司内部展厅样稿。商标及公司材料归其权利人所有。

67 条档案与 18 个大类、327 个细分类来自用户提供的 `2026.9.10 存档.xlsx`。仅从原文件读取；来源行号保存在 `public/data/catalog.json`。其中包含 1 条 Undefined 记录。档案收录不表示品牌归属，也不表示已建立品牌与品类关系。

## 开源代码

直接依赖：React / React DOM（MIT）、Vite（MIT）、@vitejs/plugin-react（MIT）、Three.js（MIT）、@phosphor-icons/react（MIT）、d3-geo（ISC）、topojson-client（ISC）。实际依赖版本保存在 package-lock.json；各包完整许可证随 node_modules 中原包保留。

地理边界来自 world-atlas 2.0.2（ISC），由 Natural Earth 公共领域地图数据生成。展示国家级参考位置，不表示已确认的工厂园区坐标。

## 三维资源

以下 Poly Haven 资源使用 CC0 许可，下载到本地独立运行：

| 资源 | 作者 | 来源 |
| --- | --- | --- |
| Studio Small 09 环境光 | Sergej Majboroda | https://polyhaven.com/a/studio_small_09 |
| Rocky Terrain 02 材质 | Amal Kumar | https://polyhaven.com/a/rocky_terrain_02 |
| Rock Face 材质 | Dario Barresi、Greg Zaal | https://polyhaven.com/a/rock_face |
| Mountainside 扫描模型 | Dario Barresi 摄影、Rico Cilliers 处理 | https://polyhaven.com/a/mountainside |

场景中的山体几何改造、轨道、展台、地球与交互代码由本项目实现。山体为艺术化的品牌场景，不代表实际厂区或地形。

## 生成素材与视觉参考

### 2026-09-10 地球表面材质

- `public/media/materials/earth/blue-marble-july-5400.jpg`：NASA Earth Observatory 的 Blue Marble Next Generation，2004 年 7 月月合成地表，5400 × 2700。原始来源：https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/ 。原图：https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/july/world.200407.3x5400x2700.jpg 。图像由 NASA 提供；不是实时卫星图。
- `blue-marble-5400.jpg`：同一系列 2004 年 1 月原始图，本轮对比留存，当前渲染不使用。
- `earth-normal.jpg` 与 `ocean-mask.jpg`：来源于 Three.js 官方示例资源，原路径分别为 https://threejs.org/examples/textures/planets/earth_normal_2048.jpg 与 https://threejs.org/examples/textures/planets/earth_specular_2048.jpg 。用于地表法线及海陆反射区别；保留来源，不将示例代码许可证等同于所有素材的独立授权。
- 月合成原图完整本地留存；银灰大陆和深蓝海洋为实时着色处理。该材质只表达地理形态，不表示实际公司地点、订单或覆盖数量。
- `CinematicAtmosphere.js` 和 `StoryLight.js` 为本项目实现的实时背景与主线光效，无外部运行时图片请求。

`public/media/generated/` 的六组图片为本次样稿生成的概念图，图中物品不是经公司确认的实际产品。concept-film.mp4 为概念静帧的镜头运动演示，无真实工厂视频含义。concept-factory-campus.png 为独立生成的虚构建筑空间，现保留为设计参考，不再作为能力导航背景。新增连续三维概念建筑、圆角结构、样品/质检/交付展点均为本项目制作，采用 Three.js 提供的几何与环境遮蔽组件，不是实际厂区或设备模型。

Igloo、Lusion、Shoe Finder 与 Codrops 三维画廊作为构图和交互参考。未复制其专有模型、网站代码或受保护的品牌内容。完整公司展厅源码是否开源，应在正式发布前移除或取得公司数据与商标素材的公开授权。本轮没有执行公开发布。

### 首页的连续三维叙事

`HomeStoryWorld.js` 的山峰轮廓层叠雕塑、协作连接、开发结构、质量环与时间生长为本项目编写的程序几何，使用现有 Three.js 与 RoundedBoxGeometry。未复制 Igloo、Lusion 等网站的源码、模型或动画文件。保留已有材质环境来源声明。
