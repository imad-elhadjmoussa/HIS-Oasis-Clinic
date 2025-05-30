<template>
  <div class="reception-dashboard p-4  min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Reception Dashboard</h1>
      <div class="flex items-center space-x-4">
        <span class="text-gray-600">{{ currentDateTime }}</span>
        <Avatar icon="pi pi-user" class="bg-blue-500" />
      </div>
    </div>

    <!-- Animated Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <transition-group name="fade" appear>
        <Card key="total-patients"
          class="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-gray-500 font-medium">Total Patients</span>
                <span class="text-3xl font-bold">{{ animatedStats.totalPatients }}</span>
                <div class="mt-2">
                  <span :class="['text-sm', statsChange.newPatients > 0 ? 'text-green-500' : 'text-red-500']">
                    <i :class="[statsChange.newPatients > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down']"></i>
                    {{ Math.abs(statsChange.newPatients) }} this week
                  </span>
                </div>
              </div>
              <div class="relative w-16 h-16">
                <vue3-chart-js :id="'patients-chart'" :type="'doughnut'" :data="patientsChartData"
                  :options="doughnutOptions"></vue3-chart-js>
              </div>
            </div>
          </template>
        </Card>

        <Card key="today-records"
          class="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-gray-500 font-medium">Today's Records</span>
                <span class="text-3xl font-bold">{{ animatedStats.todayRecords }}</span>
                <div class="mt-2">
                  <span class="text-sm text-blue-500">
                    <i class="pi pi-chart-line"></i>
                    {{ Math.round((stats.todayRecords / stats.totalPatients) * 100) }}% of patients
                  </span>
                </div>
              </div>
              <div class="relative w-16 h-16">
                <vue3-chart-js :id="'today-chart'" :type="'bar'" :data="todayChartData"
                  :options="miniBarOptions"></vue3-chart-js>
              </div>
            </div>
          </template>
        </Card>

        <Card key="unbilled-records"
          class="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-gray-500 font-medium">Unbilled Records</span>
                <span class="text-3xl font-bold">{{ animatedStats.unbilledRecords }}</span>
                <div class="mt-2">
                  <span class="text-sm text-orange-500">
                    <i class="pi pi-exclamation-triangle"></i>
                    {{ Math.round((stats.unbilledRecords / stats.todayRecords) * 100) || 0 }}% of today
                  </span>
                </div>
              </div>
              <div class="relative w-16 h-16">
                <vue3-chart-js :id="'unbilled-chart'" :type="'doughnut'" :data="unbilledChartData"
                  :options="doughnutOptions"></vue3-chart-js>
              </div>
            </div>
          </template>
        </Card>

        <Card key="new-patients"
          class="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-gray-500 font-medium">New Patients (7d)</span>
                <span class="text-3xl font-bold">{{ animatedStats.newPatients }}</span>
                <div class="mt-2">
                  <span :class="['text-sm', statsChange.newPatients > 0 ? 'text-green-500' : 'text-red-500']">
                    <i :class="[statsChange.newPatients > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down']"></i>
                    {{ Math.abs(statsChange.newPatients) }} from last week
                  </span>
                </div>
              </div>
              <div class="relative w-16 h-16">
                <vue3-chart-js :id="'new-patients-chart'" :type="'line'" :data="newPatientsChartData"
                  :options="miniLineOptions"></vue3-chart-js>
              </div>
            </div>
          </template>
        </Card>
      </transition-group>
    </div>

    <!-- Main Graphs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Patients Trend -->
     

      <!-- Records Status -->
      <Card class="shadow-md">
        <template #title>Records Status Distribution</template>
        <template #content>
          <div class="">
            <vue3-chart-js v-if="!loadingRecords" :id="'records-status-chart'" :type="'pie'" :data="recordsStatusData"
              :options="pieChartOptions"></vue3-chart-js>
            <Skeleton v-else  />
          </div>
        </template>
      </Card>

      <!-- Gender/Age Distribution -->
      <Card class="shadow-md ">
        <template #title>Patient Demographics</template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6  ">
            <div class="h-64">
              <h3 class="text-center font-medium text-gray-600 mb-2">Gender Distribution</h3>
              <vue3-chart-js v-if="!loadingPatients" :id="'gender-distribution-chart'" :type="'doughnut'"
                :data="genderDistributionData" :options="doughnutOptions"></vue3-chart-js>
              <Skeleton v-else height="100%" />
            </div>
            <div class="h-64">
              <h3 class="text-center font-medium text-gray-600 mb-2">Age Groups</h3>
              <vue3-chart-js v-if="!loadingPatients" :id="'age-distribution-chart'" :type="'bar'"
                :data="ageDistributionData" :options="barChartOptions"></vue3-chart-js>
              <Skeleton v-else height="100%" />
            </div>
          </div>
        </template>
      </Card>
    </div>


  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import Avatar from 'primevue/avatar';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import Skeleton from 'primevue/skeleton';
import Vue3ChartJs from '@j-t-mcc/vue3-chartjs';
import { useIntervalFn } from '@vueuse/core';

export default {
  name: 'ReceptionDashboard',
  components: {
    Avatar,
    Card,
    Dropdown,
    Skeleton,
    Vue3ChartJs,
  },
  setup() {
    const allPatients = ref([]);
    const recentMedicalRecords = ref([]);
    const loadingPatients = ref(true);
    const loadingRecords = ref(true);

    const currentDateTime = computed(() => {
      return new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    const stats = ref({
      totalPatients: 0,
      todayRecords: 0,
      unbilledRecords: 0,
      newPatients: 0,
    });

    const animatedStats = ref({
      totalPatients: 0,
      todayRecords: 0,
      unbilledRecords: 0,
      newPatients: 0,
    });

    const statsChange = ref({
      newPatients: 0,
    });

    const selectedPeriod = ref({ label: 'Last 30 Days', value: 30 });
    const periodOptions = ref([
      { label: 'Last 7 Days', value: 7 },
      { label: 'Last 30 Days', value: 30 },
      { label: 'Last 90 Days', value: 90 },
      { label: 'This Year', value: 365 },
    ]);

    // Chart data and options
    const patientsChartData = computed(() => ({
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [
          allPatients.value.filter(p => p.gender?.toLowerCase() === 'male').length,
          allPatients.value.filter(p => p.gender?.toLowerCase() === 'female').length,
          allPatients.value.filter(p => !['male', 'female'].includes(p.gender?.toLowerCase())).length
        ],
        backgroundColor: ['#3b82f6', '#ec4899', '#10b981'],
        borderWidth: 0,
      }]
    }));

    const todayChartData = computed(() => ({
      labels: ['Today'],
      datasets: [{
        label: 'Records',
        data: [stats.value.todayRecords],
        backgroundColor: ['#10b981'],
        borderWidth: 0,
      }]
    }));

    const unbilledChartData = computed(() => ({
      labels: ['Unbilled', 'Billed'],
      datasets: [{
        data: [stats.value.unbilledRecords, stats.value.todayRecords - stats.value.unbilledRecords],
        backgroundColor: ['#f59e0b', '#10b981'],
        borderWidth: 0,
      }]
    }));

    const newPatientsChartData = computed(() => ({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'New Patients',
        data: [12, 19, 8, 15, 12, 6, 9], // This would be dynamic in a real app
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    }));

    const patientsTrendData = computed(() => {
      const days = selectedPeriod.value.value;
      const labels = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Simulate data - in a real app, you'd group by date from your API
      const data = labels.map((_, i) => Math.floor(Math.random() * 20) + 5);

      return {
        labels,
        datasets: [{
          label: 'Patients',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }]
      };
    });

    const recordsStatusData = computed(() => {
      const statusCounts = {
        unbilled: 0,
        billed: 0,
        paid: 0,
        other: 0
      };

      recentMedicalRecords.value.forEach(record => {
        const status = record.status?.toLowerCase() || 'other';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        } else {
          statusCounts.other++;
        }
      });

      return {
        labels: ['Unbilled', 'Billed', 'Paid', 'Other'],
        datasets: [{
          data: [statusCounts.unbilled, statusCounts.billed, statusCounts.paid, statusCounts.other],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6b7280'],
          borderWidth: 0,
        }]
      };
    });

    const genderDistributionData = computed(() => ({
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [
          allPatients.value.filter(p => p.gender?.toLowerCase() === 'male').length,
          allPatients.value.filter(p => p.gender?.toLowerCase() === 'female').length,
          allPatients.value.filter(p => !['male', 'female'].includes(p.gender?.toLowerCase())).length
        ],
        backgroundColor: ['#3b82f6', '#ec4899', '#10b981'],
        borderWidth: 0,
      }]
    }));

    const ageDistributionData = computed(() => {
      const ageGroups = {
        '0-18': 0,
        '19-30': 0,
        '31-45': 0,
        '46-60': 0,
        '61+': 0
      };

      allPatients.value.forEach(patient => {
        if (!patient.date_of_birth) return;

        const birthDate = new Date(patient.date_of_birth);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 30) ageGroups['19-30']++;
        else if (age <= 45) ageGroups['31-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else ageGroups['61+']++;
      });

      return {
        labels: Object.keys(ageGroups),
        datasets: [{
          label: 'Patients',
          data: Object.values(ageGroups),
          backgroundColor: ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
          borderWidth: 0,
        }]
      };
    });

    // Chart options
    const doughnutOptions = {
      cutout: '70%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    const miniBarOptions = {
      scales: {
        x: { display: false },
        y: { display: false },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    const miniLineOptions = {
      scales: {
        x: { display: false },
        y: { display: false },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      elements: {
        point: { radius: 0 },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    const trendChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
        },
        x: {
          grid: { display: false },
        },
      },
    };

    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
      },
    };

    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
        },
        x: {
          grid: { display: false },
        },
      },
    };

    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsResponse = await axios.get('http://localhost:5000/api/patients');
        if (patientsResponse.data) {
          allPatients.value = patientsResponse.data;
          stats.value.totalPatients = patientsResponse.data.length;

          // Calculate new patients (created in last 7 days)
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          stats.value.newPatients = patientsResponse.data.filter(patient => {
            const createdDate = new Date(patient.created_at || patient.date_of_birth);
            return createdDate > weekAgo;
          }).length;
        }
        loadingPatients.value = false;

        // Fetch medical records
        const recordsResponse = await axios.get('http://localhost:5000/api/medical-records');
        if (recordsResponse.data) {
          recentMedicalRecords.value = recordsResponse.data;

          // Calculate today's records
          const today = new Date();
          stats.value.todayRecords = recordsResponse.data.filter(record => {
            const recordDate = new Date(record.created_at);
            return (
              recordDate.getDate() === today.getDate() &&
              recordDate.getMonth() === today.getMonth() &&
              recordDate.getFullYear() === today.getFullYear()
            );
          }).length;

          // Calculate unbilled records
          stats.value.unbilledRecords = recordsResponse.data.filter(record =>
            record.status?.toLowerCase() === 'unbilled'
          ).length;
        }
        loadingRecords.value = false;
      } catch (error) {
        console.error('Error fetching data:', error);
        loadingPatients.value = false;
        loadingRecords.value = false;
      }
    };

    // Animate stats counting up
    const animateStats = () => {
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const progress = Math.min(1, (Date.now() - startTime) / duration);

        animatedStats.value.totalPatients = Math.floor(progress * stats.value.totalPatients);
        animatedStats.value.todayRecords = Math.floor(progress * stats.value.todayRecords);
        animatedStats.value.unbilledRecords = Math.floor(progress * stats.value.unbilledRecords);
        animatedStats.value.newPatients = Math.floor(progress * stats.value.newPatients);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    // Simulate week-over-week change (in a real app, you'd compare with historical data)
    const calculateChanges = () => {
      statsChange.value.newPatients = Math.floor(Math.random() * 10) - 3; // Random change between -3 and +7
    };

    onMounted(() => {
      fetchData();
      calculateChanges();

      // Start animation after a short delay to allow data to load
      setTimeout(() => {
        animateStats();
      }, 500);
    });

    // Refresh data every 5 minutes
    useIntervalFn(() => {
      fetchData();
      calculateChanges();
      animateStats();
    }, 300000);

    return {
      allPatients,
      recentMedicalRecords,
      loadingPatients,
      loadingRecords,
      currentDateTime,
      stats,
      animatedStats,
      statsChange,
      selectedPeriod,
      periodOptions,
      patientsChartData,
      todayChartData,
      unbilledChartData,
      newPatientsChartData,
      patientsTrendData,
      recordsStatusData,
      genderDistributionData,
      ageDistributionData,
      doughnutOptions,
      miniBarOptions,
      miniLineOptions,
      trendChartOptions,
      pieChartOptions,
      barChartOptions,
    };
  },
};
</script>

<style scoped>
.reception-dashboard {
  font-family: 'Inter', sans-serif;
}

.p-card {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.p-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.p-avatar {
  background-color: #3b82f6;
  color: white;
}

/* Animation styles */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>