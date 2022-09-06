export const BLOODTYPES =['AB+','AB-','A+','A-','B+','B-','O+','O-']

export const CITIESGEOLOCATION = [
    {
        name:'Addis Ababa',
        latitude:45.67,
        longtitude:78.9
    },
    {
        name:'Dire Dewa',
        latitude:55.67,
        longtitude:25.9
    },
    {
        name:'Dessie',
        latitude:85.67,
        longtitude:28.9
    },
    {
        name:'Bahir Dar',
        latitude:35.67,
        longtitude:53.9
    }
]

export const CITYNAMES = CITIESGEOLOCATION.map(cityDetail=>{
    return cityDetail.name.toLowerCase()
})

export const PAGESIZE = 10