"use client"

import { Active } from "@kodmq/core/constants"
import { Job } from "@kodmq/core/types"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import Modal from "@/components/modal/Modal"
import * as InfoList from "@/components/ui/InfoList"
import { formatDate, formatDuration, titleize } from "@/lib/utils"

export type JobModalProps = {
  job: Job
  onClose: () => void
}

export default function JobModal({ job, onClose }: JobModalProps) {
  return (
    <Modal
      title={`Job #${job.id}`}
      onClose={onClose}
    >
      <InfoList.Root>
        <InfoList.Item label="ID">
          <span className="text-accent">#{job.id}</span>
        </InfoList.Item>
        
        <InfoList.Item label="Status">
          <StatusBadge status={job.status} />

          {job.status === Active && (
            <span className="text-zinc-500"> for {formatDuration(job.startedAt, new Date())}</span>
          )}

          {job.retryJobId && (
            <span className="text-zinc-500"> will be retried as <span className="text-accent">#{job.retryJobId}</span></span>
          )}
        </InfoList.Item>

        <InfoList.Item label="Name">
          {titleize(job.name)} <span className="text-zinc-500">({job.name})</span>
        </InfoList.Item>

        <InfoList.Item label="Payload">
          <Payload format>{job.payload}</Payload>
        </InfoList.Item>

        <InfoList.Item label="Created At">
          {formatDate(job.createdAt)}
        </InfoList.Item>

        <InfoList.Item label="Scheduled to Run At">
          {formatDate(job.runAt) ?? <EmptyValue />}
        </InfoList.Item>

        <InfoList.Item label="Started At">
          {formatDate(job.startedAt) ?? <EmptyValue />}
        </InfoList.Item>

        <InfoList.Item label="Finished At">
          {formatDate(job.finishedAt) ?? <EmptyValue />}
          {job.startedAt && job.finishedAt && (
            <span className="text-accent"> (in {formatDuration(job.startedAt, job.finishedAt)})</span>
          )}
        </InfoList.Item>
        
        <InfoList.Item label="Failed At">
          {formatDate(job.failedAt) ?? <EmptyValue />}
          {job.startedAt && job.failedAt && (
            <span className="text-accent"> (in {formatDuration(job.startedAt, job.failedAt)})</span>
          )}
        </InfoList.Item>

        <InfoList.Item label="Failed Attempts">
          {job.failedAttempts}
        </InfoList.Item>

        <InfoList.Item label="Error Message">
          {job.errorMessage ?? <EmptyValue />}
        </InfoList.Item>

        <InfoList.Item label="Error Stack">
          {job.errorStack ?? <EmptyValue />}
        </InfoList.Item>
      </InfoList.Root>
    </Modal>
  )
}
