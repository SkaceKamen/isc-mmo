export type BatchJob = {
	count: number
	index: number
	itemsPerTick: number
	callback: (i: number) => void
}

export class BatchJobs {
	jobs = [] as BatchJob[]

	add(
		job: Pick<BatchJob, 'count' | 'callback'> &
			Partial<Pick<BatchJob, 'itemsPerTick'>>
	) {
		this.jobs.push({
			...job,
			index: 0,
			itemsPerTick: job.itemsPerTick ?? 2
		})
	}

	tick() {
		this.jobs = this.jobs.filter((job) => {
			const next = Math.min(job.index + job.itemsPerTick, job.count)

			for (; job.index < next; job.index++) {
				job.callback(job.index)
			}

			return job.index !== job.count
		})
	}
}
