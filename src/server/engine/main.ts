import { useState } from 'react'
const basePath = process.cwd()
const sha1 = require(`${basePath}/node_modules/sha1`)
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`)

interface Iconfig {
  format: {
    width: number
    height: number
  }
  baseUri: string
  description: string
  uniqueDnaTorrance: number
  namePrefix: string
  network: string
  layerConfigurations: {
    growEditionSizeTo: number
    layersOrder: Array<{
      name: string
    }>
  }
  solanaMetadata?: {
    symbol: string
    seller_fee_basis_points: number
    external_url: string
    creators: Array<{
      address: string
      share: number
    }>
  }
}

interface IincomingLayerObj {
  layerName: string
  attributes: Array<{
    layer: string
    name: string
    image: string
  }>
}

interface Ilayer {
  id: number
  elements: Array<{
    id: number
    name: string
    filename: string
    image: string
    weight: number
  }>
  name: string
  blend: string
  opacity: number
  bypassDNA: boolean
}

type Ilayers = Array<Ilayer>

interface IlayerToDna {
  name: string
  blend: string
  opacity: number
  selectedElement: {
    id: number
    name: string
    filename: string
    image: string
    weight: number
  }
}

const GENERATE = async (
  __layers: Array<IincomingLayerObj>,
  config: Iconfig
) => {
  const {
    format,
    baseUri,
    description,
    uniqueDnaTorrance,
    namePrefix,
    network,
    layerConfigurations,
    solanaMetadata,
  } = config

  const [imageArray, setImageArray] = useState<
    Array<{
      id: string
      generatedImage: string
    }>
  >([])

  const [jsonArray, setJsonArray] = useState<
    Array<{
      id: string
      generatedJson: string
    }>
  >([])

  const [jsonSingleFile, setJsonSingleFile] = useState<string>()

  const canvas = createCanvas(format.width, format.height)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  var metadataList: Array<any> = []
  var attributesList: Array<any> = []
  var dnaList = new Set()
  const DNA_DELIMITER = '-'
  const rarityDelimiter = '#'

  const getRarityWeight = (_str: string) => {
    console.log('getRarityWeight is run \n')
    let nameWithoutExtension = _str.slice(0, -4)
    var nameWithoutWeight = Number(
      nameWithoutExtension.split(rarityDelimiter).pop()
    )
    if (isNaN(nameWithoutWeight)) {
      nameWithoutWeight = 1
    }
    return nameWithoutWeight
  }

  const cleanDna = (_str: string) => {
    console.log('cleanDna is run \n')
    const withoutOptions = removeQueryStrings(_str)
    var dna = Number(withoutOptions.split(':').shift())
    return dna
  }

  const cleanName = (_str: string) => {
    console.log('cleanName is run \n')
    let nameWithoutExtension = _str.slice(0, -4)
    var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift()
    return nameWithoutWeight
  }

  const getElements = (layerObj: IincomingLayerObj) => {
    console.log('getElements is run \n')
    return layerObj.attributes
      .filter((attr: any) => !/(^|\/)\.[^\/\.]/g.test(attr.name))
      .map((i: any, index: number) => {
        if (i.name.includes('-')) {
          throw new Error(
            `layer name can not contain dashes, please fix: ${i.name}`
          )
        }
        return {
          id: index,
          name: cleanName(i.name),
          filename: i.name,
          image: i.image,
          weight: getRarityWeight(i.name),
        }
      })
  }

  const layersSetup = (__layers: Array<IincomingLayerObj>) => {
    console.log('layersSetup is run \n')
    let layers
    if (__layers[0] && __layers[0].layerName) {
      layers = __layers.map((layerObj, index) => ({
        id: index,
        elements: getElements(layerObj),
        name: layerObj.layerName,
        blend: 'source-over',
        opacity: 1,
        bypassDNA: false,
      }))
    }
    return layers
  }

  const saveImage = (_editionCount: number) => {
    console.log('saveImage is run is run \n')
    setImageArray((prevArray) => [
      ...prevArray,
      {
        id: `${_editionCount}.png`,
        generatedImage: canvas.toDataURL('image/png'),
      },
    ])
  }

  const addMetadata = (_dna: string, _edition: number) => {
    console.log('addMetadata is run \n')
    let dateTime = Date.now()
    let tempMetadata = {
      name: `${namePrefix} #${_edition}`,
      description: description,
      image: `${baseUri}/${_edition}.png`,
      dna: sha1(_dna),
      edition: _edition,
      date: dateTime,
      attributes: attributesList,
      compiler: 'HashLips Art Engine',
    }
    if (network == 'sol') {
      tempMetadata = {
        //Added metadata for solana
        name: tempMetadata.name,
        //@ts-ignore
        symbol: solanaMetadata?.symbol,
        description: tempMetadata.description,
        //Added metadata for solana
        seller_fee_basis_points: solanaMetadata?.seller_fee_basis_points,
        image: `${_edition}.png`,
        //Added metadata for solana
        external_url: solanaMetadata?.external_url,
        edition: _edition,
        attributes: tempMetadata.attributes,
        properties: {
          files: [
            {
              uri: `${_edition}.png`,
              type: 'image/png',
            },
          ],
          category: 'image',
          creators: solanaMetadata?.creators,
        },
      }
    }
    metadataList.push(tempMetadata)
    attributesList = []
  }

  const startCreating = async () => {
    console.log('startCreting is run \n')
    let layerConfigIndex = 0
    let editionCount = 1
    let failedCount = 0
    let abstractedIndexes: Array<number> = []
    if (layerConfigurations.growEditionSizeTo) {
      for (
        let i = network == 'sol' ? 0 : 1;
        i <= layerConfigurations.growEditionSizeTo;
        i++
      ) {
        abstractedIndexes.push(i)
      }
    }
    //@ts-ignore
    const layers: Ilayers = layersSetup(__layers)
    while (editionCount <= layerConfigurations.growEditionSizeTo) {
      let newDna = createDna(layers)
      if (isDnaUnique(dnaList, newDna)) {
        // @ts-ignore
        let results: Array<IlayerToDna> = constructLayerToDna(newDna, layers)
        let loadedElements: Array<any> = []

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer))
        })

        await Promise.all(loadedElements).then((renderObjectArray) => {
          ctx.clearRect(0, 0, format.width, format.height)
          renderObjectArray.forEach((renderObject, index) => {
            drawElement(
              renderObject,
              index,
              layerConfigurations.layersOrder.length
            )
          })
          if (abstractedIndexes[0]) {
            saveImage(abstractedIndexes[0])
            addMetadata(newDna, abstractedIndexes[0])
            saveMetaDataSingleFile(abstractedIndexes[0])
          }
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
              newDna
            )}`
          )
        })
        dnaList.add(filterDNAOptions(newDna))
        editionCount++
        abstractedIndexes.shift()
      } else {
        console.log('DNA exists!')
        failedCount++
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations.growEditionSizeTo} artworks!`
          )
          process.exit()
        }
      }
    }
    layerConfigIndex++
    writeMetaData(JSON.stringify(metadataList, null, 2))
  }

  const addAttributes = (_element: any) => {
    console.log('addAttributes is run \n')
    let selectedElement = _element.layer.selectedElement
    attributesList.push({
      trait_type: _element.layer.name,
      value: selectedElement.name,
    })
  }

  //NEEDS CHANGING
  const loadLayerImg = async (_layer: IlayerToDna) => {
    console.log('loadLayerImg is run \n')
    try {
      return new Promise(async (resolve) => {
        const image = await loadImage(_layer.selectedElement.image)
        resolve({ layer: _layer, loadedImage: image })
      })
    } catch (error) {
      console.error('Error loading image:', error)
    }
  }

  const drawElement = (
    _renderObject: any,
    _index: number,
    _layersLen: number
  ) => {
    console.log('drawElement is run \n')
    ctx.globalAlpha = _renderObject.layer.opacity
    ctx.globalCompositeOperation = _renderObject.layer.blend
    ctx.drawImage(_renderObject.loadedImage, 0, 0, format.width, format.height)

    addAttributes(_renderObject)
  }

  const constructLayerToDna = (_dna: string = '', _layers: Ilayers) => {
    console.log('constructLayerToDna is run \n')
    let mappedDnaToLayers = _layers.map((layer, index) => {
      let selectedElement
      selectedElement = layer.elements.find(
        // @ts-ignore1
        (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
      )
      return {
        name: layer.name,
        blend: layer.blend,
        opacity: layer.opacity,
        selectedElement: selectedElement,
      }
    })
    return mappedDnaToLayers
  }

  /**
   * In some cases a DNA string may contain optional query parameters for options
   * such as bypassing the DNA isUnique check, this function filters out those
   * items without modifying the stored DNA.
   *
   * @param {String} _dna New DNA string
   * @returns new DNA string with any items that should be filtered, removed.
   */
  const filterDNAOptions = (_dna: string) => {
    console.log('filterDNAOptions is run \n')
    const dnaItems = _dna.split(DNA_DELIMITER)
    const filteredDNA = dnaItems.filter((element) => {
      const query = /(\?.*$)/
      const querystring = query.exec(element)
      if (!querystring) {
        return true
      }
      const options = querystring[1]?.split('&').reduce((r, setting): any => {
        const keyPairs = setting.split('=')
        if (typeof keyPairs == 'string')
          return { ...r, [keyPairs[0]]: keyPairs[1] }
      }, [])

      return false
    })

    return filteredDNA.join(DNA_DELIMITER)
  }

  /**
   * Cleaning function for DNA strings. When DNA strings include an option, it
   * is added to the filename with a ?setting=value query string. It needs to be
   * removed to properly access the file name before Drawing.
   *
   * @param {String} _dna The entire newDNA string
   * @returns Cleaned DNA string without querystring parameters.
   */
  const removeQueryStrings = (_dna: string) => {
    console.log('removeQueryStrings is run \n')
    const query = /(\?.*$)/
    return _dna.replace(query, '')
  }

  const isDnaUnique = (_DnaList = new Set(), _dna = '') => {
    console.log('isDnaUnique is run \n')
    const _filteredDNA = filterDNAOptions(_dna)
    return !_DnaList.has(_filteredDNA)
  }

  const createDna = (_layers: Ilayers) => {
    console.log('createDna is run \n')
    let randNum: Array<string> = []
    _layers.forEach((layer) => {
      var totalWeight = 0
      layer.elements.forEach((element) => {
        totalWeight += element.weight
      })
      // number between 0 - totalWeight
      let random = Math.floor(Math.random() * totalWeight)
      for (var i = 0; i < layer.elements.length; i++) {
        // subtract the current weight from the random weight until we reach a sub zero value.
        //@ts-ignore
        random -= layer.elements[i]?.weight
        if (random < 0) {
          return randNum.push(
            `${layer.elements[i]?.id}:${layer.elements[i]?.filename}${
              layer.bypassDNA ? '?bypassDNA=true' : ''
            }`
          )
        }
      }
    })
    return randNum.join(DNA_DELIMITER)
  }

  const writeMetaData = (_data: string) => {
    console.log('writeMetaData is run \n')
    setJsonSingleFile(_data)
  }

  const saveMetaDataSingleFile = (_editionCount: number) => {
    console.log('saveMetaDataSingleFile is run \n')
    let metadata = metadataList.find((meta) => meta.edition == _editionCount)
    setJsonArray((prevArray) => [
      ...prevArray,
      {
        id: `${_editionCount}.json`,
        generatedJson: JSON.stringify(metadata, null, 2),
      },
    ])
  }

  startCreating()
  return {
    imageArray,
    jsonArray,
    jsonSingleFile,
  }
}

export default GENERATE