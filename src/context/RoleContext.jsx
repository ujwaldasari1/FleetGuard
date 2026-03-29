import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { seedDrivers, seedCertifications, seedIncidents } from '../data/seedData'

const RoleContext = createContext()

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('fg_role') || '')
  const [userName, setUserName] = useState(() => localStorage.getItem('fg_name') || '')
  const [drivers, setDrivers] = useState([])
  const [certifications, setCertifications] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [useFirebase, setUseFirebase] = useState(false)

  const login = (name, selectedRole) => {
    localStorage.setItem('fg_role', selectedRole)
    localStorage.setItem('fg_name', name)
    setRole(selectedRole)
    setUserName(name)
  }

  const logout = () => {
    localStorage.removeItem('fg_role')
    localStorage.removeItem('fg_name')
    setRole('')
    setUserName('')
  }

  // Load data from Firestore or fall back to seed data
  const loadData = useCallback(async () => {
    setLoading(true)
    if (db) {
      try {
        const [dSnap, cSnap, iSnap] = await Promise.all([
          getDocs(collection(db, 'drivers')),
          getDocs(collection(db, 'certifications')),
          getDocs(collection(db, 'incidents')),
        ])
        const dData = dSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const cData = cSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const iData = iSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

        if (dData.length > 0) {
          setDrivers(dData)
          setCertifications(cData)
          setIncidents(iData)
          setUseFirebase(true)
          setLoading(false)
          return
        }
      } catch (e) {
        console.warn('Firestore read failed, using seed data:', e.message)
      }
    }
    // Fallback to seed data
    setDrivers([...seedDrivers])
    setCertifications([...seedCertifications])
    setIncidents([...seedIncidents])
    setUseFirebase(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // CRUD helpers
  const addDriver = async (driver) => {
    if (useFirebase) {
      const ref = await addDoc(collection(db, 'drivers'), driver)
      setDrivers((prev) => [...prev, { id: ref.id, ...driver }])
    } else {
      const newDriver = { ...driver, id: generateId('drv') }
      setDrivers((prev) => [...prev, newDriver])
    }
  }

  const updateDriver = async (id, data) => {
    if (useFirebase) {
      await updateDoc(doc(db, 'drivers', id), data)
    }
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)))
  }

  const deleteDriver = async (id) => {
    if (useFirebase) {
      await deleteDoc(doc(db, 'drivers', id))
    }
    setDrivers((prev) => prev.filter((d) => d.id !== id))
  }

  const addCertification = async (cert) => {
    if (useFirebase) {
      const ref = await addDoc(collection(db, 'certifications'), cert)
      setCertifications((prev) => [...prev, { id: ref.id, ...cert }])
    } else {
      const newCert = { ...cert, id: generateId('cert') }
      setCertifications((prev) => [...prev, newCert])
    }
  }

  const updateCertification = async (id, data) => {
    if (useFirebase) {
      await updateDoc(doc(db, 'certifications', id), data)
    }
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const deleteCertification = async (id) => {
    if (useFirebase) {
      await deleteDoc(doc(db, 'certifications', id))
    }
    setCertifications((prev) => prev.filter((c) => c.id !== id))
  }

  const addIncident = async (incident) => {
    if (useFirebase) {
      const ref = await addDoc(collection(db, 'incidents'), incident)
      setIncidents((prev) => [...prev, { id: ref.id, ...incident }])
    } else {
      const newInc = { ...incident, id: generateId('inc') }
      setIncidents((prev) => [...prev, newInc])
    }
  }

  const updateIncident = async (id, data) => {
    if (useFirebase) {
      await updateDoc(doc(db, 'incidents', id), data)
    }
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }

  return (
    <RoleContext.Provider
      value={{
        role,
        userName,
        login,
        logout,
        drivers,
        certifications,
        incidents,
        loading,
        addDriver,
        updateDriver,
        deleteDriver,
        addCertification,
        updateCertification,
        deleteCertification,
        addIncident,
        updateIncident,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
