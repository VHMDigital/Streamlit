/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2024)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Utility functions used to concatenate Arrow tables. This is used by
 * the add row functionality for dataframe, table & charts.
 */

import range from "lodash/range"
import zip from "lodash/zip"

import { Data, Index, Types } from "./arrowParseUtils"
import {
  getTypeName,
  IndexTypeName,
  RangeIndex,
  sameDataTypes,
  sameIndexTypes,
  Type,
} from "./arrowTypeUtils"

/** Concatenate the original DataFrame index with the given one. */
function concatIndexes(
  thisIndex: Index,
  thisIndexTypes: Type[],
  otherIndex: Index,
  otherIndexTypes: Type[]
): Index {
  // If one of the `index` arrays is empty, return the other one.
  // Otherwise, they will have different types and an error will be thrown.
  if (otherIndex.length === 0) {
    return thisIndex
  }
  if (thisIndex.length === 0) {
    return otherIndex
  }

  // Make sure indexes have same types.
  if (!sameIndexTypes(thisIndexTypes, otherIndexTypes)) {
    const receivedIndexTypes = otherIndexTypes.map(index => getTypeName(index))
    const expectedIndexTypes = thisIndexTypes.map(index => getTypeName(index))

    throw new Error(`
Unsupported operation. The data passed into \`add_rows()\` must have the same
index signature as the original data.

In this case, \`add_rows()\` received \`${JSON.stringify(receivedIndexTypes)}\`
but was expecting \`${JSON.stringify(expectedIndexTypes)}\`.
`)
  }

  if (thisIndexTypes.length === 0) {
    // This should never happen!
    throw new Error("There was an error while parsing index types.")
  }

  // NOTE: "range" index cannot be a part of a multi-index, i.e.
  // if the index type is "range", there will only be one element in the index array.
  if (thisIndexTypes[0].pandas_type === IndexTypeName.RangeIndex) {
    // Continue the sequence for a "range" index.
    // NOTE: The metadata of the original index will be used, i.e.
    // if both indexes are of type "range" and they have different
    // metadata (start, step, stop) values, the metadata of the given
    // index will be ignored.
    const { step, stop } = thisIndexTypes[0].meta as RangeIndex
    otherIndex = [
      range(
        stop,
        // End is not inclusive
        stop + otherIndex[0].length * step,
        step
      ),
    ]
  }

  // Concatenate each index with its counterpart in the other table
  const zipped = zip(thisIndex, otherIndex)
  // @ts-expect-error We know the two indexes are of the same size
  return zipped.map(a => a[0].concat(a[1]))
}

/** Concatenate the original DataFrame data with the given one. */
function concatData(
  thisData: Data,
  thisDataType: Type[],
  otherData: Data,
  otherDataType: Type[]
): Data {
  // If one of the `data` arrays is empty, return the other one.
  // Otherwise, they will have different types and an error will be thrown.
  if (otherData.numCols === 0) {
    return thisData
  }
  if (thisData.numCols === 0) {
    return otherData
  }

  // Make sure `data` arrays have the same types.
  if (!sameDataTypes(thisDataType, otherDataType)) {
    const receivedDataTypes = otherDataType.map(t => t.pandas_type)
    const expectedDataTypes = thisDataType.map(t => t.pandas_type)

    throw new Error(`
Unsupported operation. The data passed into \`add_rows()\` must have the same
data signature as the original data.

In this case, \`add_rows()\` received \`${JSON.stringify(receivedDataTypes)}\`
but was expecting \`${JSON.stringify(expectedDataTypes)}\`.
`)
  }

  // Remove extra columns from the "other" DataFrame.
  // Columns from otherData are used by index without checking column names.
  const slicedOtherData = otherData.selectAt(range(0, thisData.numCols))
  return thisData.concat(slicedOtherData)
}

/** Concatenate index and data types. */
function concatTypes(thisTypes: Types, otherTypes: Types): Types {
  const index = concatIndexTypes(thisTypes.index, otherTypes.index)
  const data = concatDataTypes(thisTypes.data, otherTypes.data)
  return { index, data }
}

/** Concatenate index types. */
function concatIndexTypes(
  thisIndexTypes: Type[],
  otherIndexTypes: Type[]
): Type[] {
  // If one of the `types` arrays is empty, return the other one.
  // Otherwise, an empty array will be returned.
  if (otherIndexTypes.length === 0) {
    return thisIndexTypes
  }
  if (thisIndexTypes.length === 0) {
    return otherIndexTypes
  }

  // Make sure indexes have same types.
  if (!sameIndexTypes(thisIndexTypes, otherIndexTypes)) {
    const receivedIndexTypes = otherIndexTypes.map(index => getTypeName(index))
    const expectedIndexTypes = thisIndexTypes.map(index => getTypeName(index))

    throw new Error(`
Unsupported operation. The data passed into \`add_rows()\` must have the same
index signature as the original data.

In this case, \`add_rows()\` received \`${JSON.stringify(receivedIndexTypes)}\`
but was expecting \`${JSON.stringify(expectedIndexTypes)}\`.
`)
  }

  // TL;DR This sets the new stop value.
  return thisIndexTypes.map(indexType => {
    // NOTE: "range" index cannot be a part of a multi-index, i.e.
    // if the index type is "range", there will only be one element in the index array.
    if (indexType.pandas_type === IndexTypeName.RangeIndex) {
      const { stop, step } = indexType.meta as RangeIndex
      const {
        start: otherStart,
        stop: otherStop,
        step: otherStep,
      } = otherIndexTypes[0].meta as RangeIndex
      const otherRangeIndexLength = (otherStop - otherStart) / otherStep
      const newStop = stop + otherRangeIndexLength * step
      return {
        ...indexType,
        meta: {
          ...indexType.meta,
          stop: newStop,
        },
      }
    }
    return indexType
  })
}

/** Concatenate types of data columns. */
function concatDataTypes(
  thisDataTypes: Type[],
  otherDataTypes: Type[]
): Type[] {
  if (thisDataTypes.length === 0) {
    return otherDataTypes
  }

  return thisDataTypes
}

/** Concatenate the index, data, and types of parsed arrow tables. */
export function concat(
  thisTypes: Types,
  thisIndex: Index,
  thisData: Data,
  otherTypes: Types,
  otherIndex: Index,
  otherData: Data
): { index: Index; data: Data; types: Types } {
  // Concatenate all data into temporary variables. If any of
  // these operations fail, an error will be thrown and we'll prematurely
  // exit the function.
  const index = concatIndexes(
    thisIndex,
    thisTypes.index,
    otherIndex,
    otherTypes.index
  )
  const data = concatData(thisData, thisTypes.data, otherData, otherTypes.data)
  const types = concatTypes(thisTypes, otherTypes)

  return { index, data, types }
}
