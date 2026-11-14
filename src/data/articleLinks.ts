/** Career id to a guide on the articles site. Unknown ids use the index. */
export const ARTICLES_INDEX = "https://aiteksolutions.net/articles";

const guide = (slug: string): string => `${ARTICLES_INDEX}/${slug}`;

export const articleLinks: Record<string, string> = {
  "frontend-developer": guide("frontend-developer-career-guide-skills-portfolio-and-landing-the-job"),
  "backend-developer": guide("backend-engineer-career-guide-skills-projects-and-how-to-get-hired"),
  "devops-engineer": guide("cloud-and-devops-career-guide-from-first-server-to-sre-interviews"),
  "cybersecurity-analyst": guide("cybersecurity-career-guide-entry-routes-certifications-and-hiring"),
  "forward-deployed-engineer": guide("forward-deployed-engineer-in-2026-what-the-job-really-is-and-how-new-grads-get-i"),
  "ml-researcher": guide("becoming-an-ml-engineer-from-scratch-a-12-month-plan-with-real-resources"),
  "electrician": guide("how-to-start-a-career-in-the-skilled-trades-apprenticeships-and-pay"),
  "plumber": guide("how-to-start-a-career-in-the-skilled-trades-apprenticeships-and-pay"),
  "hvac-tech": guide("how-to-start-a-career-in-the-skilled-trades-apprenticeships-and-pay"),
  "welder": guide("how-to-start-a-career-in-the-skilled-trades-apprenticeships-and-pay"),
  "lineworker": guide("how-to-start-a-career-in-the-skilled-trades-apprenticeships-and-pay"),
  "carpenter": guide("construction-careers-carpentry-equipment-operators-and-managers"),
  "construction-laborer": guide("construction-careers-carpentry-equipment-operators-and-managers"),
  "equipment-operator": guide("construction-careers-carpentry-equipment-operators-and-managers"),
  "construction-manager": guide("construction-careers-carpentry-equipment-operators-and-managers"),
  "industrial-mechanic": guide("manufacturing-and-industrial-maintenance-careers-how-to-get-hired"),
  "machinist": guide("manufacturing-and-industrial-maintenance-careers-how-to-get-hired"),
  "cdl-driver": guide("cdl-trucking-warehouse-and-supply-chain-careers-how-to-start"),
  "delivery-driver": guide("cdl-trucking-warehouse-and-supply-chain-careers-how-to-start"),
  "logistician": guide("cdl-trucking-warehouse-and-supply-chain-careers-how-to-start"),
  "registered-nurse": guide("nursing-careers-cna-lpn-rn-and-np-paths-and-how-to-get-hired"),
  "lpn": guide("nursing-careers-cna-lpn-rn-and-np-paths-and-how-to-get-hired"),
  "medical-assistant": guide("allied-health-careers-six-fast-routes-into-healthcare-jobs"),
  "pharmacy-tech": guide("allied-health-careers-six-fast-routes-into-healthcare-jobs"),
  "radiologic-tech": guide("allied-health-careers-six-fast-routes-into-healthcare-jobs"),
  "pta": guide("allied-health-careers-six-fast-routes-into-healthcare-jobs"),
  "dental-hygienist": guide("allied-health-careers-six-fast-routes-into-healthcare-jobs"),
};

export function guideUrl(careerId: string): string {
  return articleLinks[careerId] ?? ARTICLES_INDEX;
}
