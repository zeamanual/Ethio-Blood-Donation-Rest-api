export const BLOODTYPES =['AB+','AB-','A+','A-','B+','B-','O+','O-']

export const CITIESGEOLOCATION = [
    {
        name: 'Addis Ababa',
        latitude: 9.1450,
        longitude: 40.489673
    },
    {
        name: 'Dire Dawa',
        latitude: 9.6000,
        longitude: 41.8662
    },
    {
        name: 'Dessie',
        latitude: 11.1200,
        longitude: 39.6300
    },
    {
        name: 'Bahir Dar',
        latitude: 11.5936,
        longitude: 37.3900
    },
    {
        name: 'Gondar',
        latitude: 12.6100,
        longitude: 37.4600
    },
    {
        name: 'Jimma',
        latitude: 7.6800,
        longitude: 36.8300
    },
    {
        name: 'Hawassa',
        latitude: 7.0600,
        longitude: 38.4800
    },
    {
        name: 'Mekelle',
        latitude: 13.4900,
        longitude: 39.4697
    },
    {
        name: 'Nekemte',
        latitude: 9.0900,
        longitude: 36.5300
    },
    {
        name: 'Debre Markos',
        latitude: 10.3500,
        longitude: 37.7200
    },
    {
        name: 'Arba Minch',
        latitude: 6.0300,
        longitude: 37.5500
    },
    {
        name: 'Jijiga',
        latitude: 9.3500,
        longitude: 42.8000
    },
    {
        name: 'Shashamane',
        latitude: 7.2000,
        longitude: 38.6000
    },
    {
        name: 'Debre Birhan',
        latitude: 9.6800,
        longitude: 39.5300
    },
    {
        name: 'Dilla',
        latitude: 6.4100,
        longitude: 38.3200
    },
    {
        name: 'Sodo',
        latitude: 6.9000,
        longitude: 37.7500
    },
    {
        name: 'Adama',
        latitude: 8.5400,
        longitude: 39.2700
    },
    {
        name: 'Hosaena',
        latitude: 7.5500,
        longitude: 37.8500
    },
    {
        name: 'Gedeo',
        latitude: 6.7500,
        longitude: 38.4300
    },
    {
        name: 'Asosa',
        latitude: 10.0700,
        longitude: 34.5300
    },
    {
        name: 'Woldiya',
        latitude: 11.7800,
        longitude: 39.6200
    },
    {
        name: 'Harar',
        latitude: 9.3200,
        longitude: 42.1300
    },
    {
        name: 'Bonga',
        latitude: 7.2800,
        longitude: 36.2400
    },
    {
        name: 'Metu',
        latitude: 8.3000,
        longitude: 35.6000
    },
    {
        name: 'Adigrat',
        latitude: 14.2800,
        longitude: 39.4700
    },
    {
        name: 'Sebeta',
        latitude: 9.1500,
        longitude: 38.4300
    },
    {
        name: 'Fiche',
        latitude: 9.8000,
        longitude: 38.7200
    },
    {
        name: 'Wondo Genet',
        latitude: 6.9000,
        longitude: 38.4000
    },
    {
        name: 'Giyon',
        latitude: 8.5300,
        longitude: 37.9700
    },
    {
        name: 'Bati',
        latitude: 11.1900,
        longitude: 40.0200
    },
    {
        name: 'Gimbi',
        latitude: 9.1700,
        longitude: 35.8300
    },
    {
        name: 'Mizan Teferi',
        latitude: 6.9900,
        longitude: 35.5800
    },
    {
        name: 'Shire',
        latitude: 14.1000,
        longitude: 38.2700
    },
    {
        name: 'Wenji',
        latitude: 9.0300,
        longitude: 38.5000
    },
    {
        name: 'Afar',
        latitude: 11.1500,
        longitude: 40.0200
    },
    {
        name: 'Shire Inda Selassie',
        latitude: 14.1300,
        longitude: 38.3000
    },
    {
        name: 'Bako',
        latitude: 5.7800,
        longitude: 36.5700
    },
    {
        name: 'Guder',
        latitude: 8.9800,
        longitude: 37.8500
    },
    {
        name: 'Bedele',
        latitude: 8.4500,
        longitude: 36.3600
    },
    {
        name: 'Goba',
        latitude: 7.0100,
        longitude: 39.9700
    },
    {
        name: 'Kembolcha',
        latitude: 11.0900,
        longitude: 39.7400
    },
    {
        name: 'Agaro',
        latitude: 7.8500,
        longitude: 36.6500
    },
    {
        name: 'Korem',
        latitude: 12.5100,
        longitude: 39.5200
    },
    {
        name: 'Mendi',
        latitude: 9.8000,
        longitude: 35.1000
    },
    {
        name: 'Nejo',
        latitude: 9.5000,
        longitude: 35.5000
    },
    {
        name: 'Sokoru',
        latitude: 9.5000,
        longitude: 37.0300
    },
    {
        name: 'Gobabis',
        latitude: 7.0166,
        longitude: 39.9833
    },
    {
        name: 'Yirga Alem',
        latitude: 6.0500,
        longitude: 38.5000
    }
]

export const CITYNAMES = CITIESGEOLOCATION.map(cityDetail=>{
    return cityDetail.name
})

export const PAGESIZE = 10