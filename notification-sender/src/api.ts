export interface MomentAPI {
  id: string
  startDate: string
  endDate: string
  region: string
  timezone: string
  localTime: string
  localDate: string
}

export const fetchMomentForRegion = async (region: string): Promise<MomentAPI> => {
  const moment: MomentAPI = await fetch(`https://mobile-l7.bereal.com/api/bereal/moments/last/${region}`)
    .then(response => response.json());

  return moment;
};
