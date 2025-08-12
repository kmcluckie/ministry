<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">
      Welcome to Ministry Tracker
    </h1>
    
    <div class="grid md:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-semibold">Persons</h2>
          </div>
        </template>
        <p class="text-gray-600 mb-4">
          Manage and track visits to congregation members
        </p>
        <UButton to="/persons" color="primary" block>
          Go to Persons
        </UButton>
      </UCard>
      
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-semibold">Time Records</h2>
          </div>
        </template>
        <p class="text-gray-600 mb-4">
          Track time spent in ministry and congregation activities
        </p>
        <UButton to="/time" color="primary" block>
          Go to Time Records
        </UButton>
      </UCard>
    </div>
  </div>
</template>

