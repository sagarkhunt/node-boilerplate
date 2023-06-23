// response message translate
const translateResponseMessage = (req, validation, attribute) => {
    if (validation) {
        if (typeof attribute === 'string') {
            return req.i18n.t(`validation:${validation}`, {
                attribute: req.i18n.t(attribute),
            })
        }

        if (typeof attribute === 'object') {
            for (let [key, value] of Object.entries(attribute)) {
                key = req.i18n.t(value)
            }

            return req.i18n.t(`validation:${validation}`, {
                attribute,
            })
        }
    }

    return req.i18n.t(attribute)
}

/**
 * The search string is converted to a regex string.
 * @param {String} searchStr
 * @returns
 */
const str2regex = (searchStr) => {
    const regexStr = searchStr.split('') // Search string split (convert in array)

    regexStr.forEach((ele, ind) => {
        if (
            [
                '.',
                '+',
                '*',
                '?',
                '^',
                '$',
                '(',
                ')',
                '[',
                ']',
                '{',
                '}',
                '|',
                '\\',
            ].find((e) => ele === e)
        )
            regexStr[ind] = `\\${regexStr[ind]}`
    })

    return regexStr.join('')
}

// generate slug
const generateSlug = (x) => {
    return _.toLower(x)
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
}

/**
 * dynamic sorting if use aggregation query
 * @param {string} sortBy
 * @returns {Object}
 */
const sortAggregation = (sortBy) => {
    let sort = {}
    if (sortBy) {
        sortBy.split(',').forEach((sortOption) => {
            const [key, order] = sortOption.split(':')
            sort = { ...sort, [key]: order === 'desc' ? -1 : 1 }
        })
    } else {
        sort = { createdAt: -1 }
    }
    return sort
}

/**
 * set search field array query for aggregation
 * @param {Array} searchFields
 * @param {String} searchValue
 * @returns {Array}
 */
const searchAggregation = (searchFields, searchValue) => {
    searchValue = /[\.\+\*\?\^\$\(\)\[\]\{\}\|\\]/.test(searchValue)
        ? str2regex(searchValue)
        : searchValue // The search string is converted to a regex string.

    const search = []
    if (searchFields.length) {
        searchFields.map((item) => {
            search.push({ [item]: { $regex: searchValue, $options: 'i' } })
            return true
        })
    }

    return search
}

/**
 * Set pagination query for aggregation
 * @param {Object} options
 * @param {Number} skip
 * @returns {Promise<Array>}
 */
const paginationQuery = (options, skip) => {
    const query = [
        {
            $unset: '__v',
        },
        {
            $facet: {
                pagination: [
                    {
                        $count: 'totalResults',
                    },
                    {
                        $addFields: {
                            page: Number(options.page || 1),
                            limit: Number(options.limit || 10),
                            totalPages: {
                                $ceil: {
                                    $divide: [
                                        '$totalResults',
                                        Number(options.limit || 10),
                                    ],
                                },
                            },
                        },
                    },
                ],
                data: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: Number(options.limit || 10),
                    },
                ],
            },
        },
        {
            $unwind: {
                path: '$pagination',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        {
                            results: '$data',
                        },
                        '$pagination',
                    ],
                },
            },
        },
        {
            $unwind: {
                path: '$pagination',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]
    return query
}

module.exports = {
    translateResponseMessage,
    str2regex,
    generateSlug,
    sortAggregation,
    searchAggregation,
    paginationQuery,
}
